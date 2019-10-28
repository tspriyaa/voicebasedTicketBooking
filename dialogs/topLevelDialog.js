const { ComponentDialog, NumberPrompt, TextPrompt,ConfirmPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { UserProfile } = require('../userProfile');
const axios = require('axios');
const smsSender = require('../services/SmsSender');
const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { DateResolverDialog } = require('./dateResolverDialog');
const { ReviewSelectionDialog, REVIEW_SELECTION_DIALOG } = require('./reviewSelectionDialog');


var builder = require('botbuilder');
const { InputHints } = require('botbuilder');

const TOP_LEVEL_DIALOG = 'TOP_LEVEL_DIALOG';

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';

const DATE_RESOLVER_DIALOG = 'dateResolverDialog';
let mobileNo ='';
let fromLoc = '';
let toLoc ='';
let travelDate ='';
this.name ='';

const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const getData = (mobNo) => {
       return axios.get('api/getClient/',
    {
        params: {
            mobileNo : mobNo
        }
    }).then(res=>{
        return res.data;

    });
}



class TopLevelDialog extends ComponentDialog {
    constructor() {
        super(TOP_LEVEL_DIALOG);
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT));
        this.addDialog(new DateResolverDialog(DATE_RESOLVER_DIALOG));      
        this.addDialog(new ReviewSelectionDialog());

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.welcomeStep.bind(this),
            this.welcomeStepPrompt.bind(this),
            this.enterMobileStep.bind(this),
            this.enterMobilePrompt.bind(this),
            this.confirmMobileStep.bind(this),
            this.fromLocationStep.bind(this),
            this.fromLocationPrompt.bind(this),
            this.toLocationStep.bind(this),
            this.toLocationPrompt.bind(this),
            this.travelDateStep.bind(this),
            this.travelDatePrompt.bind(this),
            this.confirmBookingDetails.bind(this),
            this.confirmBookingPrompt.bind(this),
            this.costStep.bind(this),
            this.costPrompt.bind(this),
            this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async welcomeStep(stepContext) {
        await  stepContext.context.sendActivity( {
            text: 'Welcome to TightWallet booking system. Are you a previous customer?',
            speak: 'Welcome to Tight Wallet Booking system. Are you a previous customer?.' ,
            inputHint: InputHints.IgnoringInput         
            } );
        return await stepContext.next();
    }

    async welcomeStepPrompt(stepContext) {
        const promptOptions = { prompt: 'Are you a previous customer?' };
        return await stepContext.prompt(CONFIRM_PROMPT, promptOptions);
    }

    async enterMobileStep(stepContext){
        if(stepContext.result) {
            await  stepContext.context.sendActivity( {
                text: 'Mobile Number Verification',
                speak: 'Please enter your mobile number.' ,
                inputHint: InputHints.IgnoringInput         
                } );
            return await stepContext.next();
        } else  {
            return await stepContext.beginDialog(REVIEW_SELECTION_DIALOG);
        }
    }

    async enterMobilePrompt(stepContext){
        const promptOptions = { prompt: 'Please enter your mobile number.' };
        return await stepContext.prompt(TEXT_PROMPT, promptOptions);
    }

    async confirmMobileStep(stepContext){
        this.mobileNo = stepContext.result;
        const data = await getData(this.mobileNo);
        this.name = data[1].firstName;
      
        const messageText= `Hi '${data[1].firstName}', would you like to find the best deal on a flight booking? '`;  
           await stepContext.context.sendActivity( {
              text: 'Confirmation',
              speak: messageText,
              inputHint: InputHints.IgnoringInput 
              } );  
          return await stepContext.prompt(CONFIRM_PROMPT, { prompt: messageText });
    }

    async fromLocationStep(stepContext){
        await  stepContext.context.sendActivity( {
            text: 'From Location',
            speak: 'Where would you like to book the flight from?' ,
            inputHint: InputHints.IgnoringInput         
            } );
        return await stepContext.next();
    }
    async fromLocationPrompt(stepContext){
        const promptOptions = { prompt: 'Where would you like to book the flight from?' };
        return await stepContext.prompt(TEXT_PROMPT, promptOptions);
    }

    async toLocationStep(stepContext){      
        this.fromLoc = stepContext.result;
        await  stepContext.context.sendActivity( {
            text: 'Destination',
            speak: 'To what city would you like to travel?' ,
            inputHint: InputHints.IgnoringInput         
            } );
        return await stepContext.next();
    }
    async toLocationPrompt(stepContext){
        const promptOptions = { prompt: 'To what city would you like to travel?' };
        return await stepContext.prompt(TEXT_PROMPT, promptOptions);
    }

    async travelDateStep(stepContext){      
        this.toLoc = stepContext.result;
        await  stepContext.context.sendActivity( {
            text: 'Date of Travel',
            speak: 'On which date would you like to travel?' ,
            inputHint: InputHints.IgnoringInput         
            } );
        return await stepContext.next();
    }
    async travelDatePrompt(stepContext){
        const promptOptions = { prompt: 'On which date would you like to travel?' };
        return await stepContext.beginDialog(DATE_RESOLVER_DIALOG, { });
    }
    async confirmBookingDetails(stepContext){
        this.travelDate = stepContext.result;
        const messageText = `Please confirm, ${this.name} have you traveling to: ${ this.toLoc } from: ${ this.fromLoc } on: ${ this.travelDate }. Is this correct?`;
        await  stepContext.context.sendActivity( {
            text: 'Confirmation',
            speak: messageText ,
            inputHint: InputHints.IgnoringInput         
            } );
        return await stepContext.next();
    }
    async confirmBookingPrompt(stepContext){  
        const messageText = `Please confirm, I have you traveling to: ${ this.toLoc } from: ${ this.fromLoc } on: ${ this.travelDate}. Is this correct?`;      
        return await stepContext.prompt(CONFIRM_PROMPT, { prompt: messageText });
    }
    async costStep(stepContext){
        const messageText = `That would cost 10 thousand on city bank credit card, 9.6 thousand on your HDFC debit card, shall we proceed to book with your HDFC? `;
        await  stepContext.context.sendActivity( {
            text: 'Price Confirmation',
            speak: messageText ,
            inputHint: InputHints.IgnoringInput         
            } );
        return await stepContext.next();
    }
    async costPrompt(stepContext){  
        //hardcoded value for suggestion given- this could be derived by hosting an AI api
        const messageText =  `That would cost 10 thousand on city bank credit card, 9.6 thousand on your HDFC debit card, shall we proceed to book with your HDFC card? `;
        return await stepContext.prompt(CONFIRM_PROMPT, { prompt: messageText });
    }
    async finalStep(stepContext) {
        const userProfile = stepContext.values.userInfo;
       // emailSender.sendmail();
        const msg= `Thanks for booking your flight via tight wallet ${ this.name }. The link to authorize payment will be sent on your mobile number.`;
        smsSender.sendSms();
        await stepContext.context.sendActivity(msg, msg);
        return await stepContext.endDialog();
    }
  
    isAmbiguous(timex) {
        const timexPropery = new TimexProperty(timex);
        return !timexPropery.types.has('definite');
    }
}

module.exports.TopLevelDialog = TopLevelDialog;
module.exports.TOP_LEVEL_DIALOG = TOP_LEVEL_DIALOG;
