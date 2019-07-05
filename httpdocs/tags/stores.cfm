<cfparam name="Attributes.regions" default="#StructNew()#"/>
<cfparam name="Attributes.template" default=""/>

<!--- Make sure it only runs on start --->
<cfif thisTag.executionMode EQ "start">
<article class="container" id="ALL">
	<div class="row">
		<div class="col-xs-12 smooth-scroll">
			<h2 class="text-center bold">All Stores</h2>
			<hr>
		</div><!-- /col -->
		<div class="col-md-12">
			<div class="row">
			<cfloop array="#Attributes.regions#" index="region" >
				<cfscript>
				savecontent variable="template" {
					include Attributes.template;
				}
				WriteOutput( application.Mustache.render(template, region) );
				</cfscript>
			</cfloop>
			</div>
		</div>
	</div>
</article>
</cfif>