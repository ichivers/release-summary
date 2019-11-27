VSS.init({
    explicitNotifyLoaded: true,
    usePlatformStyles: true
});

VSS.require(["TFS/Dashboards/WidgetHelpers", "VSS/Authentication/Services"], function (WidgetHelpers, Services) {
    WidgetHelpers.IncludeWidgetConfigurationStyles();
    VSS.register("ReleaseSummaryWidget.Configuration", function () {
        var projectId = VSS.getWebContext().project.id;        
        var accountName = VSS.getWebContext().account.name;     
        var $releaseDropdown = $("#release-dropdown");
        return {
            load: function (widgetSettings, widgetConfigurationContext) {
                var settings = JSON.parse(widgetSettings.customSettings.data);
                VSS.getAccessToken().then(function(token){
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
                        }                    
                    }).error(function (e) {
                        console.log(e);
                        return WidgetHelpers.WidgetStatusHelper.Failure('Definitions error' + e.status + ': ' + e.statusText);
                    });
                });                                               
                $releaseDropdown.on("change", function () {
                    var customSettings = {
                        data: JSON.stringify({
                            release: $releaseDropdown.val()
                        })
                    };
                    var eventName = WidgetHelpers.WidgetEvent.ConfigurationChange;
                    var eventArgs = WidgetHelpers.WidgetEvent.Args(customSettings);
                    widgetConfigurationContext.notify(eventName, eventArgs);
                });            
                return WidgetHelpers.WidgetStatusHelper.Success();
            },
            onSave: function () {
                var customSettings = {
                    data: JSON.stringify({
                        release: $releaseDropdown.val()
                    })
                };
                return WidgetHelpers.WidgetConfigurationSave.Valid(customSettings);
            }
        }
    });
    VSS.notifyLoadSucceeded();
});