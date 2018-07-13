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

app.use('/getStore', function(req, res, next) {
  mongoose.connect('mongodb://localhost/ebay_titler', function(err) {
  if(err) {
    throw new Error(err);
  }
  else {
    next();
  }
});
},

function(req, res, next) {
  // Удаляем коллекцию чтобы очистить старые данные
  Item.removeAllListeners();
  mongoose.connection.dropCollection('items', function(err) {
    if(err && err.message !== 'ns not found') {
      throw err;
    }
    else {
      next();
    }
  });
},
function(req, res, next) {
let max = 5050;

  for(let page = 100; page > 0; page --) {
    // Параметры для отправки на апи ebay
    let params = {
      'OPERATION-NAME': 'findItemsAdvanced',
      'itemFilter.name': 'Seller',
      'itemFilter.value': req.body.value, // tomtop.mall
      'paginationInput.pageNumber': page
    };

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
          img: oneItem.galleryURL[0],
        });

        ItemMongo.save(function(err) {
          if(err) {
            throw err;
          }
        });
      });
      
      max -= page;
      // console.log(max);
      if(max === 0) {
        next();
      }
    });
    
  }
},
function(req, res, next) {
  console.log('successfull');
  Item.aggregate([
    {
      "$group": { "_id": {  "title": "$title" },
        "dups": { "$push": "$link"  },
        "count": {  "$sum": 1 }
      }
    },
    {
      "$match": { "count":  {  "$gt": 1  }, "dups": { "$not": /var/ }  }
    }
  ], function(err, result) {
      if(err) {
        throw err;
      }

      res.json({data: result});
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
