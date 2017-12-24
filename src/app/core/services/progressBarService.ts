import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subscription} from "rxjs/Subscription";
import {Logger} from "../logger/logger";
import {isNullOrUndefined} from "util";
import "rxjs/add/observable/interval"
import "rxjs/add/observable/timer"
import {take} from "rxjs/operators";

export class ProgressBarService {
    className : string;
    mode : string;
    pBarColor : string;
    barValue : BehaviorSubject<number>;
    barBufferValue : BehaviorSubject<number>;
    showBarProgress : BehaviorSubject<boolean>;
    autoOnNavigationSubject : BehaviorSubject<boolean>;
    onDemandsubscription  : Subscription;
    barIncrementDiv  : number;
    bufferMultiple : number;
    autoOnNavigation: boolean;
    logger: Logger;

    /**
     *
     * @param _logger
     */
    constructor(_logger: Logger) {
        this.className = "ProgressBarService";
        this.mode = "determinate";
        this.barValue = new BehaviorSubject(0);
        this.barBufferValue = new BehaviorSubject(0);
        this.showBarProgress = new BehaviorSubject(false);
        this.autoOnNavigation = false;
        this.autoOnNavigationSubject = new BehaviorSubject(this.autoOnNavigation);
        this.barIncrementDiv = 10;
        this.bufferMultiple  = 1.2;
        this.pBarColor = "primary";
        this.logger = _logger;
    }

    /**
     *
     */
    private fullProgress(){
        this.mode = "determinate";
        this.barValue.next(100);
        this.barBufferValue.next(100);
    }

    /**
     *
     * @param autoCancel
     */
    onDemandProgressBar(autoCancel?: boolean){
        //this.resetProgressBar();
        this.showBarProgress.next(true);
        if(!isNullOrUndefined(autoCancel) && autoCancel){
            this.onDemandsubscription = Observable.interval(300).pipe(take(25)).subscribe(index =>{
                //this.logger.debug(this.className," take val >>> ", index)
                this.incrementProgress();
                if(index == 24){
                    this.resetProgressBar();
                }
            });
        }else{
            this.onDemandsubscription = Observable.interval(100).subscribe(()=>{
                this.incrementProgress();
            });
        }
    }

    /**
     *
     */
    cancelOnDemandProgressBar(){
        if(this.onDemandsubscription){
            this.onDemandsubscription.unsubscribe();
        }
        this.resetProgressBar();
    }

    /**
     *
     * @param show
     * @param auto
     */
    progressBarShowHide(show : boolean, auto? : boolean){
        if(!isNullOrUndefined(auto) && auto){
            if(this.autoOnNavigationSubject.getValue()){
                this.showBarProgress.next(show);
            }
        }else{
            this.showBarProgress.next(show);
        }

    }

    /**
     *
     * @param auto
     */
    incrementProgress(auto? : boolean){
        if(!isNullOrUndefined(auto) && auto){
            if(this.autoOnNavigationSubject.getValue()){
                let remainingValue = 100 - this.barValue.getValue();
                let remainingBuffer = 100 - this.barBufferValue.getValue();
                let value = (this.barValue.getValue()) + (remainingValue/this.barIncrementDiv);
                let bvalue = (this.barBufferValue.getValue()) + ((remainingBuffer*this.bufferMultiple)/this.barIncrementDiv);
                this.barValue.next(value);
                this.barBufferValue.next(bvalue);
                //this.logger.debug(this.className," bar value >>  ", this.barValue.getValue(), " buffer value   >> ", this.barBufferValue.getValue());
            }
        }else{
            let remainingValue = 100 - this.barValue.getValue();
            let remainingBuffer = 100 - this.barBufferValue.getValue();
            let value = (this.barValue.getValue()) + (remainingValue/this.barIncrementDiv);
            let bvalue = (this.barBufferValue.getValue()) + ((remainingBuffer*this.bufferMultiple)/this.barIncrementDiv);
            this.barValue.next(value);
            this.barBufferValue.next(bvalue);
            //this.logger.debug(this.className," bar value >>  ", this.barValue.getValue(), " buffer value   >> ", this.barBufferValue.getValue());
        }

    }

    /**
     *
     */
    resetProgressBar(){
        this.fullProgress();
        let _subscription  : Subscription = Observable.interval(200).pipe(take(1)).subscribe(()=>{
            this.showBarProgress.next(false);
            this.mode = "determinate";
            this.barValue.next(0);
            this.barBufferValue.next(0);
            _subscription.unsubscribe();
        })

    }
}