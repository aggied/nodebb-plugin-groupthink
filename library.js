'use strict';

var	async = require.main.require('async'),
	Categories = module.parent.require('./categories'),
	categoriesController = module.parent.require('./controllers/categories'),
	winston = module.parent.require('winston'),
	Groups = module.parent.require('./groups'),
	Privileges = module.parent.require('./privileges'),

	plugin = {};

	plugin.onLoad=function(params, callback) {
		function render(req, res, next) {
			res.render('admin/plugins/groupthink', {});
		}

		params.router.get('/admin/plugins/groupthink', params.middleware.admin.buildHeader, render);
		params.router.get('/api/admin/plugins/groupthink', render);

		callback();
	};

	plugin.groupCreate = function(data,callback){
		//CAUTION --- the act of creating a category creates a series of system
		//groups to handle ACL. The following if statement is REQUIRED so as to not create
		//categories for those system groups and trigger an infinite loop. 

		if (data.group.hidden>0 || data.group.system>0){
			return callback(null,data);
		}

		Categories.create({
			name:data.group.name,
			description:'Parent category for '+ data.group.name,
			icon:'fa-check'
		},function(err,category){
			data.group.cid = category.cid;

			var adminRescind = ['find', 'read', 'topics:create', 'topics:reply', 'purge', 'mods'],
				userPrivRescind = ['find', 'read', 'topics:create', 'topics:reply', 'purge', 'mods'],
				guestPrivRescind = ['find', 'read', 'topics:create', 'topics:reply', 'purge', 'mods'],
				groupPrivGive = ['find','read','topics:create','topics:reply'];

			async.series(
				[
					async.apply(Privileges.categories.rescind,adminRescind,category.cid,'administrators'),
					async.apply(Privileges.categories.rescind,userPrivRescind,category.cid,'registered-users'),
					async.apply(Privileges.categories.rescind,guestPrivRescind,category.cid,'guests'),
					async.apply(Privileges.categories.give,groupPrivGive,category.cid,data.group.name)
				],
				callback(null,data)
			);

		});
	};

	plugin.getCategory = function(data,callback){
		if (!data.category || !data.category.name || !data.uid)
			return callback(null,data);

		Groups.get(data.category.name,{uid:data.uid},function(err,group){
			if (err){
				winston.error('no group for category',{cid:data.category.cid})
				return callback(err,data);
			}

			if (!group || !group.name){
				var err1 = new Error('no group exists for that category');
				callback(err1,false);
			}

			data.category.group = group;

			if (!group.isMember){
				//IMORTANT FOR ACL
				delete data.category.topics;
			}


			callback(null,data);
		});
	}


	plugin.buildCategory = function(data,callback){
		if (data.req.renderGroup){
			return data.res.render('groups/details',data.templateData);
		}

		if (data.templateData.group && !data.templateData.group.isMember){
			//IMORTANT FOR ACL. Same check done in plugin.getCategory but run again for good measure
			delete data.templateData.topics;
		}
		
		callback(null,data);
	};

	plugin.buildGroup = function(data,callback){
		//this hook is the final step before returning the group to the client
		//get the category for the group, and the "filter:category.build" hook
		//will render the "groups/details" view. See plugin.buildCategory 

		//dont show the default NodeBB group feed
		//TODO prevent NodeBB from getting the "posts" object before here as it's a wasted db query
		delete data.templateData.posts; 

		if (!data.templateData.group.isMember){
			return callback(null,data);
		}

		data.req.params.category_id=data.templateData.group.cid;
		data.req.renderGroup=true;
		categoriesController.get(data.req,data.res,function(err){
			if (err){
				data.res.status(500).end();
				winston.error(err);
			}
		});
	};

	plugin.admin= {
		menu: function(custom_header, callback) {
			custom_header.plugins.push({
				"route": '/plugins/groupthink',
				"icon": 'fa-edit',
				"name": 'Groupthink'
			});

			callback(null, custom_header);
		}
	};

module.exports = plugin;
