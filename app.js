const createError = require('http-errors'),
  express = require('express'),
  logger = require('morgan'),
  Ebay = require('ebay'),
  mongoose = require('mongoose');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const ebay = new Ebay({
  app_id: 'EgorVolo-titler-PRD-f66850dff-5f54355a'
});

// Создаем схему для вноса данных в монго.
let itemSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  category: String, // category name
  img: String, // url-address by item-image
  link: String, // url-address by item
  title: String,
});
const Item = mongoose.model('Item', itemSchema);

app.use('/getStore', function(req, res, next) {
  // Коннект к бд
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
  let max = 0;

  // Запрашиваем данные с ebay с помощью api 100 раз
  // (по одному разу на каждую страницу).
  // Больше 100 страниц api не дает получить.
  for(let page = 1; page < 100; page++) {
    max += page;
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
        console.error(err);
      }

      if(data.findItemsAdvancedResponse[0].ack[0] == "Failure" ||
      data.findItemsAdvancedResponse[0].searchResult[0].item === undefined ||
      data.findItemsAdvancedResponse[0].searchResult[0].item === null) {
        res.end('fail');
        return;
      }

      else {
        if(data.findItemsAdvancedResponse[0].searchResult[0].item !== undefined ||
          data.findItemsAdvancedResponse[0].searchResult[0].item !== null) {

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
                  console.error(err);
                }
              });
            });

            // Так как функция асинхронная, этим способом мы будем точно знать,
            // что все 100 страниз успешно сохранены
            max -= page; 

            if(max === 0) {
              next();
            }
          }
        }
    });
  }
},
function(req, res, next) {
  // Для получения одинаковых тайтлов используем агрегацию
  Item.aggregate([
    {
      '$group': { '_id': { 'title': '$title' },
        'count': { '$sum': 1 },
        'dups': { '$push': '$link' },
      }
    },
    {
      '$match': { 'count':  { '$gt': 1 }, 'dups': { '$not': /var/ } } // Убираем из выдачи все ссылки в которых есть 'var'.
    }
  ], function(err, result) {
    if(err) {
      throw err;
    }

    // Отравляем данные клиенту в формате json
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
