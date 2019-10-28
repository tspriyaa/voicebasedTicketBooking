// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ChoicePrompt, ComponentDialog, WaterfallDialog,NumberPrompt, TextPrompt,ConfirmPrompt  } = require('botbuilder-dialogs');

const { InputHints } = require('botbuilder');

const smsSender = require('../services/SmsSender');
const REVIEW_SELECTION_DIALOG = 'REVIEW_SELECTION_DIALOG';

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';

const CONFIRM_PROMPT = 'CONFIRM_PROMPT';

class ReviewSelectionDialog extends ComponentDialog {
    constructor() {
        super(REVIEW_SELECTION_DIALOG);

        // Define a "done" response for the company selection prompt.
        this.doneOption = 'done';

        // Define value names for values tracked inside the dialogs.
        this.companiesSelected = 'value-companiesSelected';

        // Define the company choices for the company selection prompt.
        this.companyOptions = ['Adatum Corporation', 'Contoso Suites', 'Graphic Design Institute', 'Wide World Importers'];
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.nameStep.bind(this),
            this.namePrompt.bind(this),
            this.enterMobileStep.bind(this),
            this.enterMobilePrompt.bind(this),
            this.otpVerification.bind(this),
            this.enterOtp.bind(this),
            this.verfiyOTP.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async nameStep(stepContext) {
        await  stepContext.context.sendActivity( {
            text: 'Please spell out your name',
            speak: 'Please spell out your name' ,
            inputHint: InputHints.IgnoringInput         
            } );
        return await stepContext.next();
    }

    async namePrompt(stepContext) {
        const promptOptions = { prompt: 'Please spell out your name' };
        return await stepContext.prompt(TEXT_PROMPT, promptOptions);
    }

    async enterMobileStep(stepContext){
            await  stepContext.context.sendActivity( {
                text: 'Mobile Number Verification',
                speak: 'Please enter your mobile number.' ,
                inputHint: InputHints.IgnoringInput         
                } );
            return await stepContext.next();     
    }

    async enterMobilePrompt(stepContext){
        const promptOptions = { prompt: 'Please enter your mobile number.' };
        return await stepContext.prompt(TEXT_PROMPT, promptOptions);
    }
    async otpVerification(stepContext){
        smsSender.sendSms();
         await stepContext.context.sendActivity( {
                text: 'OTP verification',
                speak: 'Please enter the otp sent to your mobile number',
                inputHint: InputHints.IgnoringInput 
                } ); 
         return await stepContext.next();   
    }
    async enterOtp(stepContext){
        const promptOptions = { prompt: 'Please enter your otp.' };
         return await stepContext.prompt(TEXT_PROMPT, promptOptions);
    }
    async verfiyOTP(stepContext) {
        if (stepContext.result != '123456') {
            await stepContext.context.sendActivity( {text: 'Wrong OTP has been entered', speak :'Wrong OTP has been entered', inputHint: InputHints.IgnoringInput });

            return;
        } else {
            const messageText= `Your OTP details are verified`;    
            await stepContext.context.sendActivity(messageText, messageText,InputHints.IgnoringInput );   
            return await stepContext.next();
        }
    }

}

module.exports.ReviewSelectionDialog = ReviewSelectionDialog;
module.exports.REVIEW_SELECTION_DIALOG = REVIEW_SELECTION_DIALOG;
