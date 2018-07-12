var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Ebay = require('ebay');
var mongoose = require('mongoose');

var getStoreRouter = require('./routes/getStore');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


const ebay = new Ebay({
  app_id: 'EgorVolo-titler-PRD-f66850dff-5f54355a'
});

var itemSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: String,
  category: String, // category name
  link: String, // url-address by item
  img: String, // url-address by item-image
});

var Item = mongoose.model('Item', itemSchema);

app.use('/getStore', (req, res) => {
  
  mongoose.connect('mongodb://localhost/ebay_titler', function(err) {
    if(err) {
      throw new Error(err);
    }

    

    // Параметры для отправки на апи ebay
    let params = {
      'OPERATION-NAME': 'findItemsAdvanced',
      'itemFilter.name': 'Seller',
      'itemFilter.value': req.body.value // tomtop.mall
    };

    // Удаляем коллекцию чтобы очистить старые данные
    mongoose.connection.dropCollection('items', function(err) {
      if(err) throw err;

      // Отправляем запрос на получение всех товаров указанного продавца
      ebay.get('finding', params, function(err, data) {
            if(err) {
                throw new Error(err);
            }

            let response = Array.from(data.findItemsAdvancedResponse[0].searchResult[0].item);

            // Перебор данных и внос в бд
            response.map((oneItem, index) => {

            let ItemMongo = new Item({
              _id: mongoose.Types.ObjectId(),
              title: oneItem.title[0],
              category: oneItem.primaryCategory[0].categoryName[0],
              link: oneItem.viewItemURL[0],
              img: oneItem.galleryURL[0]
            });
            ItemMongo.save(function(err) {
              if(err) throw err;

              if(index === response.length - 1) {
                Item.aggregate([
                  {
                    "$group": {
                      "_id": {
                        "title": "$title"
                      },
                      "dups": {
                        "$push": "$_id"
                      },
                      "count": {
                        "$sum": 1
                      }
                    }
                  },
                  {
                    "$match": {
                      "count": {
                        "$gt": 1
                      }
                    }
                  }
                ], function (err, result) {
                  if (err) throw err;
        
                  console.log(result);
                });
              }
                // Очистим переменную
                ItemMongo = null;
              });
              
          });
        });

    });
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
