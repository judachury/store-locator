component
    output = true
    hint = 'Define the application settings and event handlers.'
{

    // Define the application settings.
    this.name = '';
	this.scriptProtect = 'All';
	this.theDatasource = '';
	this.schema = '';

    /*
		Configure the mappings. To access any mapping from any sub-directory
		you jus need to add an include and the name of the map. Use it instead of relative paths e.g:
		<cfinclude template="/inc/header.cfm" />
	*/
	this.directory = getDirectoryFromPath( ExpandPath( '.' ) );
	this.mappings[ '/app' ] = this.directory & 'app\';
	this.mappings[ '/cfc' ] = this.mappings[ '/app' ] & 'cfc\';
	this.mappings[ '/inc' ] = this.mappings[ '/app' ] & 'inc\';
	this.mappings[ '/templates' ] = this.mappings[ '/app' ] & 'templates\';
	this.mappings[ '/tags' ] = this.directory & 'httpdocs\tags\';
	
	public boolean function onApplicationStart(){
		//Initialize application components
		application.directory = this.directory;
		application.domain = '';
		
		//Use an application object for all the calls to the DB
		databaseService = CreateObject('component', 'cfc.DatabaseService');
		databaseService.init(this.theDatasource, this.schema);
		application['Service'] = databaseService;
		
		//Templating language
		application['Mustache'] = CreateObject('component', 'cfc.Mustache');
		
		return true;
	}
	
	public function onRequestStart( required string template ) {
		
		// Add x-frame-options header to stop iframe embedding
		pc = getpagecontext().getresponse();
		pc.setHeader("X-Frame-Options","DENY");
		
		if (structKeyExists(Url, 'resetappvars')) {
				
			onApplicationStart();
			WriteOutput('The application has been restarted');
			abort;
		}
		/*
		*/
			
		return true;
	}
	
}