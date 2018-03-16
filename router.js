/**
 * This module serves as the router to the different views. It handles
 * any incoming requests.
 *
 * @param app An express object that handles our requests/responses
 * @param socketIoServer The host address of this server to be injected in the views for the socketio communication
 */
 
'use strict';
 
module.exports=function(app, socketIoServer) {
    app.get('/',function(req,res){
        res.render('home',{errormessage:""});
    });
    
    app.get('/enterroom',function(req,res){
        if (!req.session.username) res.redirect('/');
        // var path = req.params.path;
        // console.log(path);
        // console.log("Requested room "+path);                                                                                                                                                                                                                 
        var render_data = {"hostAddress":req.host,
        "username":req.session.username,
        "roomid" : req.session.roomid };
        res.render('room',render_data );  
    });
    
}