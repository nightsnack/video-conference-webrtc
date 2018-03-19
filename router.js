/**
 * This module serves as the router to the different views. It handles
 * any incoming requests.
 *
 * @param app An express object that handles our requests/responses
 * @param socketIoServer The host address of this server to be injected in the views for the socketio communication
 */
 
'use strict';
 
module.exports=function(app, socketIoServer) {
    const {promisify} = require('util');
    var redis = require('redis');
    var client = redis.createClient();

    client.on('error', function(err) {
        console.log('Something went wrong ', err)
    });

    app.get('/',function(req,res){
        res.render('home',{errormessage:""});
    });
    
    app.get('/enterroom',function(req,res){
        if (!req.session.username) {res.redirect('/');res.end();return false;};
        var render_data = {"hostAddress":req.host,
        "username":req.session.username,
        "roomid" : req.session.roomid };

        getMembers(req.session.roomid).then((members) => {
            render_data.members = members;
            res.render('room',render_data );  
        }).catch((error) => {
            console.log(error);
            res.render('room',render_data );  
        })                                                                                                                                                                                                                
        
    });

    const smembersAsync = promisify(client.smembers).bind(client);

    async function getMembers(room) {
        return await smembersAsync(room);
    }
    
}