<div class="category">
	<div class="clearfix">
		<!-- IF privileges.topics:create -->
		<button id="new_topic" class="btn btn-primary">[[category:new_topic_button]]</button>
		<!-- ELSE -->
			<!-- IF !loggedIn -->
			<a href="{config.relative_path}/login" class="btn btn-primary">[[category:guest-login-post]]</a>
			<!-- ENDIF !loggedIn -->
		<!-- ENDIF privileges.topics:create -->

		<!-- IF group.isMember -->
		<span class="pull-right">
			<!-- IMPORT partials/category/watch.tpl -->
			<!-- IMPORT partials/category/tools.tpl -->
			<!-- IMPORT partials/category/sort.tpl -->
		</span>
		<!-- ENDIF group.isMember -->
	</div>

	<hr class="hidden-xs" />

	<p class="hidden-xs">{name}</p>

	<!-- IF !topics.length -->
		<!-- IF !group.isMember -->
			<div class="alert alert-warning">
				You must be a group member to view content.
			</div>
		<!-- ELSE -->
			<div class="alert alert-warning" id="category-no-topics">
				[[category:no_topics]]
			</div>
		<!-- ENDIF !group.isMember -->
	<!-- ELSE -->
		<!-- IMPORT partials/topics_list.tpl -->
	<!-- ENDIF !topics.length -->


	<!-- IF config.usePagination -->
		<!-- IMPORT partials/paginator.tpl -->
	<!-- ENDIF config.usePagination -->
</div>

<!-- IMPORT partials/move_thread_modal.tpl -->

<!-- IF !config.usePagination -->
<noscript>
	<!-- IMPORT partials/paginator.tpl -->
</noscript>
<!-- ENDIF !config.usePagination -->

