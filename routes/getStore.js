const express = require('express'),
    router = express.Router(),
    Ebay = require('ebay');

// const ebay = new Ebay({
//     app_id: 'EgorVolo-titler-PRD-f66850dff-5f54355a'
// });

// let params = {
//     'OPERATION-NAME': 'findItemsAdvanced',
//     'itemFilter.name': 'Seller',
//     'itemFilter.value': 'tomtop.mail'
// };

router.post('/', function(req, res, next) {

    // console.error(req);

    
    // ebay.get('finding', params, function(err, data) {
    //     if(err) {
    //         throw new Error(err);
    //     }

    //     if(data && data.findItemsAdvancedResponse && findItemsAdvancedResponse[0].searchResult) {
    //         console.error(data.findItemsAdvancedResponse[0].searchResult[0].item);
    //     }
    // });
});

module.exports = router;
