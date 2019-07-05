<cfimport taglib="tags/" prefix="tag" />

<tag:debug date="2017-02-15" closeDate="2017-03-13">

<cfscript>
	context = application.Service.call('loadAll', [], 7).response;
	storesByRegion = [];
	
	for (region in context) {
		regions = {
			'region': '',
			'stores': []
		};
		regions.region = context[region].region;
		
		for (store in context[region]) {
			temp = {};
			if (context[region].currentRow GT 1) {
			
				temp = {
					ACTIVEDATE:	store.ACTIVEDATE,
					COUNTY:	store.COUNTY,
					IDX:	store.IDX,
					LATITUDE:	store.LATITUDE,
					LONGITUDE:	store.LONGITUDE,
					POSTCODE:	store.POSTCODE,
					REGION:	store.REGION,
					STORENAME:	store.STORENAME,
					STREET:	store.STREET,
					TOWN:	store.TOWN,
					ENDDATE:	store.ENDDATE
				};
				
				if (len(store.LOCALITY)) {
					temp.LOCALITY = store.LOCALITY;
				}

				ArrayAppend(regions.stores, temp);
			}
		}
		ArrayAppend(storesByRegion, regions);		
	}
	//WriteDump(storesByRegion);
</cfscript>

<tag:template page="home" title="Walkers Store Locator" modal="modal">
<cfoutput>
<section class="main">

	<article class="container search-wrapper">
		<div class="row">
			<div class="panel panel-default">
			  <div class="panel-body">
				<form id="search" method="post" class="col-md-12">
					<fieldset class="row">
						<legend class="text-center bold">Store Locator</legend>
						<div class="col-xs-12">
							<p class="text-center">Find a store nearest to you by entering your Postcode or Town below:</p>
							<hr>
						</div><!-- /col -->
						<div class="input-field col-md-4 col-sm-12 col-xs-12 text-center md-form">
							<i class="prefix search-icon"></i>
<!--- 							<i class="material-icons prefix">search</i> --->
							<input id="postcode" type="text" name="postcode" class="validate">
							<label for="postcode">Enter Postcode or Town</label>
							<p class="text-danger"></p>
						</div><!-- /input -->
						<div class="input-field col-md-8 col-sm-12 col-xs-12">
							<button type="submit" class="btn btn-custom-blue block-xs waves-effect btn-md show-map bold">Find Stores</button>
							<a id="geolocation" class="btn btn-custom-blue block-xs waves-effect location-button btn-md hide bold"><i class="material-icons left">my_location</i> Use My Location</a>
							<span class="smooth-scroll">
							<a class="btn btn-default block-xs waves-effect btn-md btn-all bold" href="##ALL">All Stores</a>
							</span>
						</div><!-- /input -->
					</fieldset><!-- /row -->
				</form>		
			  </div><!-- /panel-body -->
			</div><!-- /panel -->	
		</div><!-- /row -->
	</article><!-- /container -->
	
	<article class="container hide" id="map-content">
		<div class="row">
			<div class="col-sm-12 col-md-6 col-xs-12">
			<div class="popout">
				<div class="panel-group" id="accordion">
				</div><!-- /panel-group -->
			 </div><!-- /popout -->     
			</div><!-- /col -->
			<div class="col-sm-12 col-md-6 col-xs-12">
				<div id="map-container" class="z-depth-1  animated fadeIn" style="height: 600px"></div>
			</div><!-- /col -->
		</div><!-- /row -->
		<div class="row">
			<div class="col-md-12">
				<div class="panel panel-default" style="margin-top:15px;">
					<div class="panel-body snap-share">
						<div class="col-sm-6">
							<img src="assets/img/snap-share3.jpg" alt="Snap and Share to Win" class="img-responsive">
						</div>
						<div class="col-sm-6">
							<a href="//facebook.com/walkers" target="_blank"><img src="assets/img/snap-share-guidelines.png" alt="Snap and Share to Win Guidelines" class="img-responsive"></a>
							<p class="text-center"><a href="##" class="btn btn-custom-blue waves-effect btn-sm bold" data-toggle="modal" data-target="##modal2">SEE TERMS AND CONDITIONS</a></p>
						</div>
<!---
						<div class="col-xs-12">
							<a target="_blank" href="//www.tesco.com/groceries/ProductBuylist/default.aspx?id=G00025057&icid=GSB_Walkers_DHPepsiCoWalkersTW48_ad54650_GSB&pos=top">
								<img src="assets/img/click-through.jpg" alt="Snap and Share to Win Guidelines" class="img-responsive center-block">
							</a>
						</div>
--->
					</div>
				</div>
			</div>
		</div>
	</article>
	<br>
	<br>

	<!--- Display all Stores by region --->
	<tag:stores regions="#storesByRegion#" template="/templates/StoresByRegion.mustache" />
	
</section><!-- /main -->

<script id="store-tab" type="x-tmpl-mustache">
<cfinclude template="/templates/Stores.mustache" >
</script>

<script id="destination-form" type="x-tmpl-mustache">
<cfinclude template="/templates/Destination.mustache" >
</script>


</cfoutput>
</tag:template>