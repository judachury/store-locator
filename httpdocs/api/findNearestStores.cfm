<cfscript>
context = application.Service.call('findNearestStores', [
	{'sqltype': 'cf_sql_varchar', 'value': Form.lat},
	{'sqltype': 'cf_sql_varchar', 'value': Form.lng}
]).response.rs1;

response = [];
for (store in context) {
	if (store.IDX NEQ 8) {
		temp = {
			'address1': store.STREET,
			'county': store.COUNTY,
			'date': store.ACTIVEDATE,
			'id': store.IDX,
			'lat': store.LATITUDE,
			'lng': store.LONGITUDE,
			'name': store.STORENAME,
			'postcode': store.POSTCODE,
			'enddate': store.ENDDATE,
			'town': store.TOWN,
			'zoom': 5,
			'marker': 'https://www.walkerssupersofastores.com/assets/img/WalkersMarker.png',
			'distance': NumberFormat(store.DIST, '0.0-')
		};
		
		if (len(store.LOCALITY)) {
			temp['address2'] = store.LOCALITY;
		}	
		
		ArrayAppend(response, temp);
	}
}

WriteOutput(SerializeJSON(response));
</cfscript>