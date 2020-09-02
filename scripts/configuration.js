VSS.init({
    explicitNotifyLoaded: true,
    usePlatformStyles: true
});

VSS.require(["TFS/Dashboards/WidgetHelpers", "VSS/Authentication/Services"], function (WidgetHelpers, Services) {
    WidgetHelpers.IncludeWidgetConfigurationStyles().then(function() {
        VSS.resize(400,1000)
    });
    VSS.register("ReleaseSummaryWidget.Configuration", function () {
        var projectId = VSS.getWebContext().project.id;    
        var accessToken;    
        var accountName = VSS.getWebContext().account.name;     
        var $releaseDropdown = $("#release-dropdown");
        var $releaseArtifacts = $("#release-artifacts");
        return {
            load: function (widgetSettings, widgetConfigurationContext) {
                var settings = JSON.parse(widgetSettings.customSettings.data);
                VSS.getAccessToken().then(function(token){
                    accessToken = token;
                    $.ajax({
                        type: 'get',
                        url: 'https://vsrm.dev.azure.com/' + accountName + '/' + projectId + '/_apis/release/definitions',
                        dataType: 'json',
                        cache: false,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader ("Authorization", "Bearer " + token.token);
                        },
                    }).done(function (data) {
                        $.each(data.value, function (i, item) {
                            $releaseDropdown.append($('<option>', { 
                                value: item.id,
                                text : item.name 
                            }));
                        });
                        if (settings && settings.release) {
                            $releaseDropdown.val(settings.release);
                        };
                        $.ajax({
                            type: 'get',
                            url: 'https://vsrm.dev.azure.com/' + accountName + '/' + projectId + '/_apis/release/definitions/' + $releaseDropdown.val(),
                            dataType: 'json',
                            cache: false,
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader ("Authorization", "Bearer " + accessToken.token);
                            },
                        }).done(function (data) {
                            $releaseArtifacts.empty();
                            $releaseArtifacts.append('<legend>Select articfacts to display</legend>');
                            $.each(data.artifacts, function(i, item){                                
                                $releaseArtifacts.append($('<input>', {
                                    type: 'checkbox',
                                    id: item.definitionReference.definition.id,
                                    name: "artifact",
                                    value: item.definitionReference.definition.name
                                }));
                                $releaseArtifacts.append('<label for="' + item.definitionReference.definition.id + '">' + item.definitionReference.definition.name + '</label><br/>');                            
                            });
                            if(settings && settings.artifacts){
                                $.each(settings.artifacts, function(i, item){
                                    $('#' + item).attr('checked', 'checked');
                                })
                            };
                                            
                        }).error(function (e) {
                            console.log(e);
                            return WidgetHelpers.WidgetStatusHelper.Failure('Definitions error' + e.status + ': ' + e.statusText);
                        });                    
                    }).error(function (e) {
                        console.log(e);
                        return WidgetHelpers.WidgetStatusHelper.Failure('Definitions error' + e.status + ': ' + e.statusText);
                    });
                });   
                $(document).on('change', ':checkbox', function(){
                    var customSettings = {
                        data: JSON.stringify({
                            release: $releaseDropdown.val(),
                            artifacts: $('input[name="artifact"]:checked').map(function(){
                                return this.id;
                            }).get()
                        })
                    };
                    var eventName = WidgetHelpers.WidgetEvent.ConfigurationChange;
                    var eventArgs = WidgetHelpers.WidgetEvent.Args(customSettings);
                    widgetConfigurationContext.notify(eventName, eventArgs);
                })                                            
                $releaseDropdown.on("change", function () {
                    $.ajax({
                        type: 'get',
                        url: 'https://vsrm.dev.azure.com/' + accountName + '/' + projectId + '/_apis/release/definitions/' + $releaseDropdown.val(),
                        dataType: 'json',
                        cache: false,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader ("Authorization", "Bearer " + accessToken.token);
                        },
                    }).done(function (data) {
                        $releaseArtifacts.empty();
                        $releaseArtifacts.append('<legend>Select articfacts to display</legend>');
                        $.each(data.artifacts, function(i, item){                                
                            $releaseArtifacts.append($('<input>', {
                                type: 'checkbox',
                                id: item.definitionReference.definition.id,
                                name: "artifact",
                                value: item.definitionReference.definition.name
                            }));
                            $releaseArtifacts.append('<label for="' + item.definitionReference.definition.id + '">' + item.definitionReference.definition.name + '</label><br/>');                            
                            var customSettings = {
                                data: JSON.stringify({
                                    release: $releaseDropdown.val(),
                                    artifacts: $('input[name="artifact"]:checked').map(function(){
                                        return this.id;
                                    }).get()
                                })
                            };
                            var eventName = WidgetHelpers.WidgetEvent.ConfigurationChange;
                            var eventArgs = WidgetHelpers.WidgetEvent.Args(customSettings);
                            widgetConfigurationContext.notify(eventName, eventArgs);
                        });                    
                    }).error(function (e) {
                        console.log(e);
                        return WidgetHelpers.WidgetStatusHelper.Failure('Definitions error' + e.status + ': ' + e.statusText);
                    });
                });            
                return WidgetHelpers.WidgetStatusHelper.Success();
            },
            onSave: function () {
                var customSettings = {
                    data: JSON.stringify({
                        release: $releaseDropdown.val(),
                        artifacts: $('input[name="artifact"]:checked').map(function(){
                            return this.id;
                        }).get()
                    })
                };
                return WidgetHelpers.WidgetConfigurationSave.Valid(customSettings);
            }
        }
    });
    VSS.notifyLoadSucceeded();
});