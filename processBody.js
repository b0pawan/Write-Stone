const path = require('path'),
fs = require('fs-extra'),
cheerio = require('cheerio'),
    cleancss = require('clean-css');

const rootPath = path.normalize(__dirname);
const homeBuildDir = process.argv[2];
const buildType = process.argv[3];
const DIST = path.join(rootPath, 'dist');
let index;
if(homeBuildDir && homeBuildDir.length>0){
  index = path.join(path.join(rootPath, homeBuildDir), 'index.html');
}else {
  index = path.join(path.join(rootPath, 'dist'), 'index.html');
}

const processIndexHtml = (_template) => {
    const $ = cheerio.load(_template);
    if (buildType && buildType === 'production') {
        const inlineStyles = $('style').map(function (i) {
            return $(this).html();
        }).get();

        $('style').map(function (i) {
            return $(this).remove();
        });

        if (inlineStyles && inlineStyles.length > 0) {
            for (const index in inlineStyles) {
                const inlineStyle = inlineStyles[index];
                const output = new cleancss({compatibility: 'ie9'}).minify(inlineStyle).styles;
                $('head').append('<style>' + output + '</style>');
            }
        }
    }

    const scriptSrcs = $('script').map(function (i) {
        return $(this).attr('src');
    }).get();

    const styles = $('link[rel=\'stylesheet\']').map(function (i) {
        return $(this).attr('href');
    }).get();

    // removing all scripts;
    $('script').map(function (i) {
        return $(this).remove();
    });

    // removing all links;
    $('link[rel=\'stylesheet\']').map(function (i) {
        return $(this).remove();
    });

    let appendString = '<script>';
    appendString = appendString + 'function appendScript(source) { ' +
        '  var script = document.createElement(\'script\');' +
        '  script.type = \'text/javascript\';' +
        '  script.src = '+'./'+'source; ' +
        '  script.async = false;' +
        '  document.getElementsByTagName(\'head\')[0].appendChild(script);' +
        '}';
    appendString = appendString + 'function appendLink(source) { ' +
        '  var link = document.createElement(\'link\');' +
        '  link.setAttribute(\'rel\',\'stylesheet\');' +
        '  link.setAttribute(\'href\','+'./'+'source);' +
        '  link.setAttribute(\'type\',\'text/css\');' +
        '  document.getElementsByTagName(\'head\')[0].appendChild(link);' +
        '}';
    appendString = appendString + 'document.addEventListener("DOMContentLoaded", function(event) {';
    for (const index in styles) {
        const linkhref = styles[index];
        appendString = appendString + 'appendLink(\'' + linkhref + '\');';
    }

    appendString = appendString + "if (window.document.documentMode) {";
    appendString = appendString + "appendScript('ie-polyfills.min.js');";
    appendString = appendString + "}";

    for (const index in scriptSrcs) {
        const src = scriptSrcs[index];
        appendString = appendString + 'appendScript(\'' + src + '\');';
    }
    appendString = appendString + '}, false);';
    $('head').append(appendString + '</script>');
    /*let gaString = "<script>";
    if (buildType && buildType === 'production') {
        gaString = gaString + "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');";
        gaString = gaString + "ga('create', 'UA-84278623-1', 'auto');ga('require', 'ecommerce');ga('send', 'pageview');";
        gaString = gaString + "</script>";
        $('head').append(gaString);
    }*/
    return $.html();
};

if (fs.existsSync(index)) {
    const template = processIndexHtml(fs.readFileSync(index));
    fs.removeSync(index);
    fs.writeFile(index, template, (err) => {
        if (err){
            console.log(err);
        }
        // success case, the file was saved
        console.log('new index file saved');
    });
}