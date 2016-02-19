$(document).ready(function() {
	$(window).on('action:ajaxify.end', function(event, data) {
		if (data.url.split('/')[0]=='category'){
			require(['forum/groups/details'], function(groupDetails) {
				groupDetails.init();
			});
		}else if (data.url.split('/')[0]=='groups'){
			require(['forum/category'],function(category){
				category.init();
			})
		}
	});
});