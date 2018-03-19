
var createroom = function(app) {
    const {promisify} = require('util');
    var redis = require('redis');
    var client = redis.createClient();

    client.on('error', function(err) {
        console.log('Something went wrong ', err)
    });


    var bodyParser = require('body-parser');

    // 创建 application/x-www-form-urlencoded 编码解析
    var urlencodedParser = bodyParser.urlencoded({ extended: false })


    app.post('/createroom', urlencodedParser, function(req, res) {
        var roomid = req.body.roomid;
        var username = req.body.username;
        req.session.roomid = req.body.roomid;
        req.session.username = req.body.username;
        
        const myf = myFunc(roomid,username);
        myf.then((status) => {
            if (status == true) {
                res.redirect('/enterroom');
            }
        }).catch((error) => {
            res.render('home', { errormessage: error });
                res.end();
        })
            
    });

    const sismemberAsync = promisify(client.sismember).bind(client);
    const saddAsync = promisify(client.sadd).bind(client);


    async function myFunc(room,username) {
        if (await sismemberAsync(room, username) == 0) {
            await saddAsync(room, username);
            return true;
        } else {
            reject(new Error("Your username has been used, please try another one.") );
        }
    }

}

exports.createroom = createroom;