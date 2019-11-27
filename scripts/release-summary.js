VSS.init({
    explicitNotifyLoaded: true,
    usePlatformStyles: true
});

VSS.require(["TFS/Dashboards/WidgetHelpers", "VSS/Authentication/Services"], function (WidgetHelpers, Services) {
    WidgetHelpers.IncludeWidgetStyles();
    VSS.register("ReleaseSummaryWidget", function () {
        var projectId = VSS.getWebContext().project.id;
        var accountName = VSS.getWebContext().account.name;
        var $releaseContainer = $('.release-summary-container');
        var $title = $('h2.title');
        var options = {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric"
        };
        var populateWidget = function (widgetSettings) {
            var settings = JSON.parse(widgetSettings.customSettings.data);
            if (settings && settings.release) {
                VSS.getAccessToken().then(function (token) {
                    $.ajax({
                        type: 'get',
                        url: 'https://vsrm.dev.azure.com/' + accountName + '/' + projectId + '/_apis/release/definitions/' + settings.release,
                        dataType: 'json',
                        cache: false,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("Authorization", "Bearer " + token.token);
                        },
                    }).done(function (data) {
                        $title.text(data.name);
                        $releaseContainer.empty();
                        $.each(data.environments, function (i, item) {
                            var environmentName = item.name;                            
                            var createdOn = new Date(data.createdOn);
                            $.ajax({
                                type: 'get',
                                url: item.currentRelease.url,
                                dataType: 'json',
                                cache: false,
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader("Authorization", "Bearer " + token.token);
                                },
                            }).done(function (data) {
                                var environmentStatus = '';
                                var fontAwesome = '';         
                                var releaseUrl = '';                        
                                $.each(data.environments, function(i, item){
                                    if(item.name == environmentName){
                                        environmentStatus = item.status;
                                        releaseUrl = item.release._links.web.href;
                                        switch(environmentStatus)
                                        {
                                            case "succeeded":
                                                fontAwesome = 'fas fa-check-circle';
                                                break;
                                            case "partiallySucceeded":
                                                fontAwesome = 'fas fa-exclamation-circle'
                                                break;
                                            case "rejected":
                                                fontAwesome = 'fas fa-times-circle';
                                                break;
                                            case "cancelled":
                                                fontAwesome = 'fas fa-stop-circle';
                                                break;
                                        }
                                    }
                                });          
                                var releaseItem = "<div class='release-summary-item' id='" + environmentName + "'>" +
                                    "<a target='_top' class='release-summary-link' href='" + releaseUrl + "'>" +
                                    "  <div class='release-summary-environment release-summary-" + environmentStatus + "'>" + environmentName + "</div>" +
                                    "  <div class='release-summary-details'>" +
                                    "    <div class='release-summary-icon release-summary-" + environmentStatus + "'><i class='" + fontAwesome + "'></i></div>" +
                                    "    <div class='release-summary-text'>" +
                                    "      <div class='release-summary-artifact'>" + data.artifacts[0].definitionReference.version.name + "</div>" +
                                    "      <div class='release-summary-date'>" + createdOn.toLocaleString('en', options) + "</div>" +
                                    "    </div>" +
                                    "  </div>" +
                                    "</div>" +
                                    "</a>"
                                $releaseContainer.append(releaseItem);
                            }).error(function (e) {
                                console.log(e);
                                return WidgetHelpers.WidgetStatusHelper.Failure('Current release error' + e.status + ': ' + e.statusText);
                            });
                        });
                    }).error(function (e) {
                        console.log(e);
                        return WidgetHelpers.WidgetStatusHelper.Failure('Definition error' + e.status + ': ' + e.statusText);
                    });
                });
            } else {
                $title.text("Release Summary");
            };
            return WidgetHelpers.WidgetStatusHelper.Success();
        }
        return {
            load: function (widgetSettings) {
                return populateWidget(widgetSettings);
            },
            reload: function (widgetSettings) {
                return populateWidget(widgetSettings);
            }
        }
    });
    VSS.notifyLoadSucceeded();
});