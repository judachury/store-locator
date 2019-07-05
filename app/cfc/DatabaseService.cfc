/**
 * DatabaseService: Access DB procedures
 * 	 
 */
component accessors='true' {
	
	property procService;
	property schema;
	
	public void function init(required string datasource, required string schema) {
		var spService = new storedProc();
        spService.setDatasource(datasource);
		setSchema(schema);
		setProcService(spService);
	}
	
	public struct function call(required string procedure, required array formParams = [], numeric resultSet = 1) {
		var result = {};
		result.successful = false;
		result.response = '';

		try {
		
			procService.clearProcResults();
			procService.clearParams();
			procService.setProcedure('[' & schema & '].[' & procedure & ']');
		
			// Add all the required params for this procedure
			for (i=1; i LTE ArrayLen(formParams); i+=1) {				
				procService.addParam(cfsqltype = formParams[i].sqltype, type= "in", value = formParams[i].value);
			}
			
			// set all the results sets to return
			for (i=1; i LTE resultSet; i+=1) {
				rs = 'rs' & i;
				procService.addProcResult(name = rs, resultset = i);
			}
			
			procResult = procService.execute();
			
			result.response = procResult.getProcResultSets();			
			result.successful = true;
			
		} catch (any ex) {
			result.exception = ex;
		}
		
		return result;
	}

}