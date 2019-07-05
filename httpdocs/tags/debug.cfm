<cftry>
	<!---
		Name: Debug
		Description: redirects to a holding or closing page callback
		Params:
			@debug: NOT REQUIRED - If not provided debug param will be provided from the date param
			@date: REQUIRED	- Date until when the holding page should be up, defaulted to current date
			@time: NOT REQUIRED - Defaulted to 00:0:0
			@callback: NOT REQUIRED - Redirect to this page when date is active. Defaulted to holding.html
			@closeDate: REQUIRED - Date when the closing page is up
			@closeTime: NOT REQUIRED - Defaulted to 00:0:0
			@closeCallback: NOT REQUIRED - Redirect to this page when closeDate is active. Defaulted to closed.html
	--->
	<cfparam name="Attributes.debug" default=""/>
	<cfparam name="Attributes.date" default="#DateFormat(NOW(), 'yyyy-mm-dd')#"/>
	<cfparam name="Attributes.time" default="#TimeFormat(CreateTime(0, 0, 0), 'HH:n:s')#"/>
	<cfparam name="Attributes.callback" default="holding.html"/>
	<cfparam name="Attributes.closeDate" default="" />
	<cfparam name="Attributes.closeTime" default="#TimeFormat(CreateTime(0, 0, 0), 'HH:n:s')#" />
	<cfparam name="Attributes.closeCallback" default="closed.html"/>

	<!--- default 0 is equivelent to false --->
	<cfparam name="Url.debug" default="0" type="numeric" />
	<cfparam name="Form.debug" default="0" type="numeric" />

	<!--- Make sure it only runs on start --->
	<cfif thisTag.executionMode EQ "start">
		<!---
			Local variables and time format to array
		--->
		<cfset today = NOW() />
		<cfset callbackOnError = Attributes.callback />
		<cfset Attributes.date = Attributes.date.split('-') />
		<cfset Attributes.time = listToArray(Attributes.time, ":", false, true) />
		<cfset Attributes.closeTime = listToArray(Attributes.closeTime, ":", false, true) />

		<!--- 
			If debug is not specified make it up from the date provide with any leading 0 removed in the following format:
			ddmmyy -E.g 18316 = 18 March 2016	
		--->
		<cfif Attributes.debug EQ ''>
			<cfloop array="#Attributes.date#" index="value">
				<cfset Attributes.debug = '#LSParseNumber(right(value,2))##Attributes.debug#' />
			</cfloop>
			<cfset Attributes.debug = '#LSParseNumber(Attributes.debug)#' />
		</cfif>


		<!---
			Closing date will overwrite the date for holding page
			Debug number for the holding page also works with closing page
			TODO - need to think about the above as it can be very insecure
		--->
		<cfif len(Attributes.closeDate) && ((URL.debug NEQ Attributes.debug) AND (Form.debug NEQ Attributes.debug))>
			<!---
				Time format to array for closing
			--->
			<cfset Attributes.closeDate = listToArray(Attributes.closeDate, "-", false, true) />
			<cfset timestamp = CreateDateTime(
											Attributes.closeDate[1], 
											Attributes.closeDate[2],
											Attributes.closeDate[3],
											Attributes.closeTime[1],
											Attributes.closeTime[2],
											Attributes.closeTime[3])
			/>
			
			<cfif DateDiff("s", today, timestamp) LT 0>	
				<!---
					close page
				--->			
				<cflocation url="#Attributes.closeCallback#">
				<cfabort>
			</cfif>
		</cfif>

		<!---
			Debug for holding page
		--->
		<cfif (URL.debug NEQ Attributes.debug) AND (Form.debug NEQ Attributes.debug)>
			<cfset timestamp = CreateDateTime(
						Attributes.date[1], 
						Attributes.date[2], 
						Attributes.date[3], 
						Attributes.time[1], 
						Attributes.time[2], 
						Attributes.time[3]) 
			/>
			
			<!---
				Once the timestamp passes today the result is in the negative or in the pass
			--->
			<cfif DateDiff("s", today, timestamp) GT 0>
				<!---
					holding page
				--->
				<cflocation url="#Attributes.callback#">
				<cfabort>
			</cfif>
		</cfif>
	</cfif>

	<cfcatch>
		<cflocation url="#callbackOnError#">
		<!---
			Catch Error
			<div class="error" style="display:none">
			<cfdump var="#cfcatch#" />
		--->		
	</cfcatch>
</cftry>