/*!
 * vaVallidate v0.2.5
 * Copyright 2016 VanillaActive.
 */
(function ( $ ) {
	$.fn.vaValidate = function ( options ) {
		// This is the easiest way to have default options.
        var $self = $(this),
			errors = [],
			inProgress = false,
			textMinDefault = 1,
			textMaxDefault = 500,
			$alert,
			$submit = $self.find('[type="submit"]'),
			settings = $.extend({
                // These are the defaults.
                fields: $self.find('input, select, textarea'),
                email: /^([a-zA-Z0-9_.\-/+])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/,
                tel: /^[0]{1}[\d -\(\)+]{9,20}$/,
                script: /[\<\>]+/,
				postcode: /^[a-zA-Z]{1,2}([0-9]{1,2}|[0-9][a-zA-Z])\s*[0-9][a-zA-Z]{2}$/,
				pStrength: /^(?=.*[\d])(?=.*[a-zA-Z])[^<>#]{8,}$/,
				tel: /(.{10})/,
				file: /^.*\.(jpg|jpeg|png|gif|pdf)$/i,
				genericMsg: 'Please correct the highlighted fields',
				captchaMsg: 'Please tell us that you are not a robot',
                errorClass: 'va-error',
                successClass: 'va-success',
				gCaptcha: false,
				ajax: true,
                type: 'POST',
				dataType: 'json',
				action: '',
                jqxhr: function (data) {
                    return $.ajax({
                        method: settings.type,
                        dataType: settings.dataType,
                        url: settings.action,
                        data: data                  
                    });
                },
                success: function (data) {
                    return console.log('success:', data);                       
                },
                error: function (error) {
                    return console.log('error:', error.responseText);                       
                },
                always: function () {
                    return resetForm();                       
                }
            }, options ),
			alertBox = function () {
				var $alertBox = $self.find('ul.va-alertbox');
				//Make sure you don't prepend more than one alert container
				if ($alertBox.length === 0) {
					$self.prepend('<ul class="va-alertbox bg-danger hidden"></ul>');				
				}
			},
			findAlert = function () {
				//Assign it globally
				$alert = $self.find('ul.va-alertbox');
			},
			resetForm = function () {
                var $input;

                errors = [];
                $alert.addClass('hidden').html('');

                settings.fields.each(function () {
                    $input = $(this);
                    $input.parent('div, label').removeClass(settings.errorClass);
                    $input.parent('div, label').removeClass(settings.successClass);
                });
            },
			removeRepeat = function () {
                result = [];

                errors.map(function (value) {
                    if ($.inArray(value, result) === -1) {
                        result.unshift(value);
                    }
                });  

                return result;                
            },
			showErrors = function () {
                var errorMsg = '',
                    uniques;
					
                errors.push(settings.genericMsg);
				uniques = removeRepeat();
                uniques.map(function (value) {
                    errorMsg += '<li>' + value + '</li>';
                });		
				
                if (uniques.length > 0) {
                    $alert.removeClass('hidden');
                } else {
                    $alert.addClass('hidden');
                }

                $alert.append(errorMsg);
                
                $(document.body).animate({
                    scrollTop: $self.offset().top
                }, 'slow');
            },
			validateField = function (entries) {
                var result = settings.errorClass;                

                if (testRegex('script', entries.value)) {
                    return result;
                }

                switch (entries.type) {
                    case 'text':
                        if (entries.value.length >= entries.min) {
                            result = settings.successClass;                           
                        }
                    break;
                    case 'postcode':
                        if (testRegex(entries.type, entries.value) && entries.value.length >= entries.min) {
                            result = settings.successClass;
                        }
                    break;
					case 'password':
                        if (testRegex('pStrength', entries.value) && entries.value.length >= entries.min) {
                            result = settings.successClass;
                        } else {
							if (entries.messages.required.length > 0) {
								errors.push(entries.messages.required);
							}
						}
                    break;
                    case 'email':
                        if (testRegex(entries.type, entries.value)) {
                            result = settings.successClass;
                        }                       
                    break;
                    case 'checkbox':
                        if (entries.value) {
                            result = settings.successClass;
                        }
                    break;
                    case 'select':
                        if (entries.value.length > 0) {
                            result = settings.successClass;
                        }
                    break;
					case 'textarea':
                        if (entries.value.length >= entries.min && entries.value.length <= entries.max) {
                            result = settings.successClass;
                        }
                    break;
					case 'file':
						if (testRegex(entries.type, entries.value)) {
                            result = settings.successClass;
                        }
                    break;
                    case 'tel':
                        if (testRegex(entries.type, entries.value)) {
                            result = settings.successClass;
                        }
                    break;
                }

                if (result !== settings.errorClass && entries.mirrorTo && entries.mirrorTo !== entries.value) {
                    result = settings.errorClass;
					errors.push(entries.messages.mirror);
                }

                return result;
            },
			getData = function ($el, validate, value1, value2) {
                var valid = $el.data(validate);

                return (valid) ? value1 : value2;
            },
			cleanValue = function (value, placeholder) {
                var result;
                
                if (typeof value == 'string') {
                    result = value.trim();
                }

                return result;
            },
			testRegex = function (type, value) {
                return settings[type].test(value);
            },
			defineEntries =  function ($element) {
                var type = ($element.attr('type')) ? $element.attr('type') : ($element.data('va-textarea')) ? 'textarea' : 'select',
                    inputName = $element.attr('name')
                    inputType = getData($element, 'va-postcode-strict', inputName, type),
                    inputPlh = function () {
                        if (type === 'select') {
                            return getData($element, 'va-select-placeholder', $element.find('option').first().val(), '');
                        } else {
                            return $element.attr('placeholder');
                        }
                    },
                    getValue = function () {
                        switch (type) {
                            case 'select':
                                return cleanValue($element.find('option:selected').val(), inputPlh());
                            break;
							case 'password':
								return $element.val();
							break
                            case 'checkbox':
                                return $element.prop('checked');
                            break;
                            default:
                                 return cleanValue($element.val(), inputPlh());
                            break;
                        }
                    },
                    getMirrorValue = function () {
                        var mirror = $element.data('va-mirror-to'),
                            $mirrorEl = getData($element, 'va-mirror-to', $self.find('[name=' + mirror + ']'), false);

                        if ($mirrorEl) {
                            return cleanValue($mirrorEl.val(), $mirrorEl.attr('placeholder'));
                        }

                        return false;
                    };

                return {
                    name: inputName,
                    type: inputType,
                    messages: {
                        required: getData($element, 'va-msg-required', $element.data('va-msg-required'), ''),
						optional: getData($element, 'va-msg-optional', $element.data('va-msg-optional'), ''),
                        pattern: getData($element, 'va-msg-pattern', $element.data('va-msg-pattern'), ''),
                        mirror: getData($element, 'va-msg-mirror', $element.data('va-msg-mirror'), ''),
                    },
                    value: getValue(),
                    mirrorTo: getMirrorValue(),
					pattern: getData($element, 'va-custom-pattern', $element.data('va-custom-pattern'), ''),
                    min: getData($element, 'va-min', $element.data('va-min'), textMinDefault),
					max: getData($element, 'va-max', $element.data('va-max'), textMaxDefault),
                };
            },
			validate = function () {
                var invalid = false,
					data = {},
					codes = {},
                    dob = {},
                    promise,
					captcha,
                    validating = function () {
                        var $input = $(this),
                            entries = defineEntries($input);

						if ($input.data('va-required')) {
                            validation = validateField(entries);
                            
                            $input.parent('div, label').addClass(validation);
							
							/*
								This should be removed later. Use different a way to create file inputs
							*/
							if (entries.type === 'file') {
								 $input.parent().parent().parent('div').addClass(validation);
							}
													
							//Any input will trigger showing errors
                            if (validation === settings.errorClass) {
                                invalid = true;                                 
                            }
                        } else if ($input.data('va-optional') && entries.value.length > 0) {
							validation = validateField(entries);
							
							$input.parent('div, label').addClass(validation);
							
							//Any input will trigger showing errors
                            if (validation === settings.errorClass) {
                                invalid = true;                                 
                            }
						}

                        //Put the codes and dob together and add them to data outside this function
                        if ($input.data('va-code')) {
                            codes[$input.data('va-code')] = (codes[$input.data('va-code')]) ? codes[$input.data('va-code')] + entries.value : entries.value;
                        } else if ($input.data('va-dob')) {
                            dob[$input.data('va-dob')] = entries.value;
                        } else {
                            data[entries.name] = entries.value;
                        }
                       
                    };				

                settings.fields.each(validating);
				
				 if (settings.gCaptcha) {
					 captcha = $self.find('[name="g-recaptcha-response"]').val();
					 if (captcha.length > 0) {
						data['captcha'] = captcha;
					 } else {
						errors.push(settings.captchaMsg);
						invalid = true;
					 }
				 }

				for (value in codes) {
					data[value] = codes[value];
				}

                if (dob.hasOwnProperty('day') && dob.hasOwnProperty('month') && dob.hasOwnProperty('year')) {
                   data['dob'] = dob['day'] + ' ' + dob['month'] + ' ' + dob['day'];
                   data.dob = data.dob.trim();
                }

				if (invalid) {
                    showErrors();
                } else {
					if (settings.ajax) {
						
						promise = settings.jqxhr(data);

						/*Process a succesful action*/
						promise.done(settings.success);

						/*Process error in the call*/
						promise.fail(settings.error);

						/*
						Run all the time
						promise.always(settings.always);
						*/
					} else {
						settings.success(data);
					}
                    
                }
            },
			submissionHandle = function (e) {
				e.preventDefault();

                if (inProgress) {
                    return;
                }
				
				console.info('test 123');
                inProgress = true;
                resetForm();
                validate();
                inProgress = false;
			};
			
			alertBox();
			findAlert();
			$submit.on('click', submissionHandle);
	};
} ( jQuery ));