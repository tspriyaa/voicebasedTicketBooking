const Nexmo = require('nexmo');

module.exports = {
    sendSms: function () {
           const nexmo = new Nexmo({
                        apiKey: '<<Api key from nexmo registration>>',
                        apiSecret: '<<Api secret from nexmo>>',
                    });
            
                    const from = '<<Nexmo listed number for one>>';
                    const to = '<<Nexmo listed number for to>>';
                    const text = 'OTP for verification on Tight Wallet booking is is 123456';
                    nexmo.message.sendSms(from, to, text, {type: 'unicode'},
            (err, responseData) => {
                if(err){console.log(err);}
                else {
                    console.log(responseData);
                }
            });
                    console.log('sent');
    }
  };
  

