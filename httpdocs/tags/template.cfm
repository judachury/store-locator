<!--- 
	Name: template
	Description: Creates the basic template every page needs. It creates a Template struct
		with some of the values passed in for later use. E.g to access it: #Template.page#
	Attributes:
		@page	NOT REQUIRED - Add a class at the page level or use it with the Template 
				variable to adentify the page
		@title	NOT REQUIRED - Add a page title or use it with the Template variable
				to adentify the page
		@referer NOT REQUIRED - Add the referer that should allow access to this page
		@fields NOT REQUIRED -Add comma delimiter names to make sure they are including in 
				the post request
		@redirect NOT REQUIRED - the name of the page to be redirected, extension not required.
				index is the default.
		@header NOT REQUIRED - true is default inc/header.cfm require
		@footer NOT REQUIRED - true is default inc/footer.cfm require
		@customHeader NOT REQUIRED - change basic header page
		@customFooter NOT REQUIRED - change basic header page
		@modal NOT REQUIRED - Add a modal to the page
	Notes:
	- start.cfm contains html doctype and <body> tag, ends in end.cfm (</body>) 
	  If adding styles and scripts and trackers (eg: Google Analytics),
	  they should be added in any of these to files
	- Adding custom attributes do not require the extension
--->

<!--- Set attributes default values --->
<cfparam name="Attributes.page" default=""/>
<cfparam name="Attributes.title" default=""/>
<cfparam name="Attributes.referer" default=""/>
<cfparam name="Attributes.fields" default=""/>
<cfparam name="Attributes.redirect" default="index"/>

<cfparam name="Attributes.header" default="true"/>
<cfparam name="Attributes.footer" default="true"/>

<cfparam name="Attributes.customHeader" default=""/>
<cfparam name="Attributes.customFooter" default=""/>
<cfparam name="Attributes.modal" default=""/>

<!---
	Only access the site by the referer. This condition is OK if the attribute is not added
--->
<cfif NOT FindNoCase(Attributes.referer, CGI.HTTP_REFERER) >
	<cflocation url="#Attributes.redirect#.cfm" />
	<cfabort>
</cfif>

<!--- 
	Make sure the fields have been populated before accessing the template
--->
<cfif len(Attributes.fields) >
	<cfset context = listToArray(Attributes.fields, ',', false, true) >
	
	<cfloop array="#context#" index="field">
		<!--- Someone trying to access without submiting a form --->
		<cfif NOT StructKeyExists(Form, field)>
			<cflocation url="#Attributes.redirect#.cfm" />
			<cfabort>
		<!--- Someone trying to access without the required field --->			
		<cfelseif StructKeyExists(Form, field) AND ( NOT len(Form[field]) ) >
			<cflocation url="#Attributes.redirect#.cfm" />
			<cfabort>
		</cfif>
		
	</cfloop>
</cfif>

<!--- Namespace (the name of this tag) tag attributes to refer in the includes --->
<cfset template = {
		"page": #Attributes.page#,
		"title": #Attributes.title#
	}
/>

<!--- Default locations --->
<cfset header="../inc/header.cfm" />
<cfset footer="../inc/footer.cfm" />

<cfif len(Attributes.customHeader)>
	<cfset header="../inc/#Attributes.customHeader#.cfm" />
</cfif>

<cfif len(Attributes.customFooter)>
	<cfset footer="../inc/#Attributes.customFooter#.cfm" />
</cfif>

<!--- thisTag is a context variable --->
<cfif thisTag.executionMode EQ "start">
	<!---
		Create the begining of the page
	--->
	<cfinclude template="../inc/start.cfm" />
	<cfif Attributes.header>
		<cfinclude template="#header#" />
	</cfif>
<cfelse>
	<!---
		Create the end of the page
	--->
	<cfif Attributes.footer>
		<cfinclude template="#footer#" />
	</cfif>

	<cfif len(Attributes.modal)>
		<cfinclude template="../inc/#Attributes.modal#.cfm" />
	</cfif>

	<cfinclude template="../inc/end.cfm" />
</cfif>

