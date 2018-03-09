var createroom = function(app) {
    var bodyParser = require('body-parser');

    // 创建 application/x-www-form-urlencoded 编码解析
    var urlencodedParser = bodyParser.urlencoded({ extended: false })

    // app.use(express.static('public'));

    app.post('/createroom', urlencodedParser, function(req, res) {

        // 输出 JSON 格式
        var response = {
            "roomid": req.body.roomid,
            "username": req.body.username
        };
        console.log(response);
        req.session.roomid = req.body.roomid;
        req.session.username = req.body,username;
        res.redirect('/'+roomid);
    })
}

exports.createroom = createroom;