const urls = [
    "./json/areas.json",
    "./json/topics.json",
    "./json/criterias.json",
];

var model = {
    areas: {},
    topics: {},
    criterias: {},
};

$.fn.setClass = function (classes) {
    this.attr('class', classes);
    return this;
};

function reduceCriterias(criterias) {
    let result = criterias.map((item) => {
        return {
            id: item.id,
            versionId: item.versions[0].versionId,
            maturityLevel: item.versions[0].maturityLevel,
            name: item.name,
            topicId: item.topic ? item.topic.id : item.topicId,
            topicName: item.topic ? item.topic.name : null,
        };
    });

    return result;
}

function sortCriterias(criterias) {
    console.log("[sortCriterias] Criterias In");
    console.log(criterias);

    // temporary array holds objects with position
    // and length of element
    var maturities = criterias.map(function (e, i) {
        return { index: i, value: e.versions[0].maturityLevel };
    });

    // sorting the lengths array containing the lengths of
    // river names
    maturities.sort(function (a, b) {
        return +(a.value > b.value) || +(a.value === b.value) - 1;
    });

    // copy element back to the array
    var sortedCriterias = maturities.map(function (e) {
        return criterias[e.index];
    });

    console.log("[sortCriterias] Criterias Out");
    console.log(sortedCriterias);

    return sortedCriterias;
}

const fetchData = async () => {
    try {
        let res = await Promise.all(urls.map((e) => fetch(e)));
        let resJson = await Promise.all(res.map((e) => e.json()));
        resJson = resJson.map((e) => e.results);

        model.areas = resJson[0];

        model.topics = resJson[1].map((item) => {
            return {
                id: item.id,
                name: item.name,
                description: item.description,
                domainId: item.domain.id,
                domainName: item.domain.name,
                areaId: item.area.id,
                areaName: item.area.name,
                criterias: reduceCriterias(item.criterias),
            };
        });

        model.criterias = reduceCriterias(resJson[2]);

        /*
        model.criterias = resJson[2].map((item) => {
            return {
                id: item.id,
                versionId: item.versions[0].versionId,
                maturityLevel: item.versions[0].maturityLevel,
                name: item.name,
                topicId: item.topic.id,
                topicName: item.topic.name,
            };
        });
        */

    } catch (err) {
        console.log(err);
    }
};

function displayModel(container) {
    container.html('');

    displayHierarchy("domain", "areas", model.areas, container);

    for (var i = 0; i < model.areas.length; i++) {
        const element = model.areas[i];
        const catid = `domain-areas-${element.id}`;
        const bodyid = `${catid}-body`;

        $(`#childcount-${catid}`).text(element.topics?.length);

        displayTopics(element.id, element.topics, $("#" + bodyid));
    }
}

const groupBy = (keys) => (array) =>
    array.reduce((objectsByKeyValue, obj) => {
        const value = keys.map((key) => obj[key]).join("-");
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(
            obj
        );
        return objectsByKeyValue;
    }, {});

function displayTopics(parentid, data, container) {
    displayHierarchy(parentid, "topics", data, container);

    const groupByMaturityLevel = groupBy(["maturityLevel"]);

    for (var i = 0; i < data.length; i++) {
        const element = data[i];
        const catid = `${parentid}-topics-${element.id}`;
        const bodyid = `${catid}-body`;

        try {
            let criterias = model.criterias.filter(
                (c) => c.topicId === element.id
            );
            $(`#childcount-${catid}`).text(criterias.length);
            if (criterias.length > 0)
                $(`#childcount-${catid}`).attr('class', 'badge bg-primary');
            else
                $(`#childcount-${catid}`).attr('class', 'badge bg-secondary');

            let maturityGroups = groupByMaturityLevel(criterias);
            let rows = 0;

            for (let g = 0; g < 6; g++) {
                if (!maturityGroups[g])
                    continue;
                rows =
                    maturityGroups[g].length > rows
                        ? maturityGroups[g].length
                        : rows;
            }

            console.log(element.id);
            console.log(maturityGroups);
            console.log("max rows: " + rows);

            let html = "";
            html += '<table class="table table-borderless table-sm">';
            html += "<thead>";
            html += "<tr>";
            html +=
                '<th class="text-center h4" scope="col"><span class="badge text-bg-danger">Establishing</span></th>';
            html +=
                '<th class="text-center h4" scope="col"><span class="badge text-bg-secondary">Initial</span></th>';
            html +=
                '<th class="text-center h4" scope="col"><span class="badge text-bg-warning">Developing</span></th>';
            html +=
                '<th class="text-center h4" scope="col"><span class="badge text-bg-primary">Defined</span></th>';
            html +=
                '<th class="text-center h4" scope="col"><span class="badge text-bg-info">Measurable</span></th>';
            html +=
                '<th class="text-center h4" scope="col"><span class="badge text-bg-success">Optimizing</span></th>';
            html += "</tr>";
            html += "</thead>";
            html += "<tbody>";

            for (let r = 0; r < rows; r++) {
                html += "<tr>";
                for (let c = 0; c < 6; c++) {

                    if (element.name === "Business Environment") {
                        console.log(element);
                    }
                    let item = maturityGroups[c];
                    let maturityLevel = '';
                    let id = '';
                    let versionId = '';
                    let name = '';

                    if (item) {
                        item = item[r];
                        if (item) {
                            maturityLevel = item.maturityLevel;
                            id = item.id;
                            versionId = ` (v${item.versionId})`;
                            name = item.name;
                        }
                    }

                    let bgcolor = "bg-light";
                    switch (maturityLevel) {
                        case 0:
                            bgcolor = "list-group-item-danger";
                            break;
                        case 1:
                            bgcolor = "list-group-item-secondary";
                            break;
                        case 2:
                            bgcolor = "list-group-item-warning";
                            break;
                        case 3:
                            bgcolor = "list-group-item-primary";
                            break;
                        case 4:
                            bgcolor = "list-group-item-info";
                            break;
                        case 5:
                            bgcolor = "list-group-item-success";
                            break;
                        default:
                            bgcolor = "list-group-item-light";
                            break;
                    }

                    html += `<td class="text-center fs-6">`;
                    html += `<div class="card ${bgcolor} mb-3 w-30" style="max-width: 20rem; height: 17rem;">`;
                    html += '<div class="card-body">';
                    //html += `<h5 class="card-title"><small>${id}${versionId}</small></h5>`;
                    html += `<p class="card-text fs-6"><small>${name}</small></p>`;
                    html += "</div>";
                    html += `<div class="card-footer bg-transparent"><small class="text-muted fs-6">${id}${versionId}</small></div>`;
                    html += "</div>";
                    html += `</td>`;
                }
                html += "</tr>";
            }
            html += "</tbody>";
            html += "</table>";

            $("#" + bodyid).html(html);
        } catch (error) { }
    }
}

function displayHierarchy(parentid, category, data, container) {
    var accordionid = `accordion-${parentid}-${category}`;
    var div = $("<div>", {
        id: accordionid,
        class: "accordion",
    });

    container.append(div);

    for (var i = 0; i < data.length; i++) {
        const element = data[i];
        const catid = `${parentid}-${category}-${element.id}`;
        const bodyid = `${catid}-body`;
        let expanded = "false";
        let collapse = "collapse";
        let icon = "";
        let childcountbadge = '';

        expanded = "true";
        collapse = "show";

        switch (category) {
            case "areas":
                icon = '<i class="bi bi-map-fill"></i>';
            case "topics":
                icon = '<i class="bi bi-clipboard-check-fill"></i>';
                break;
            case "criterias":
                icon = '<i class="bi bi-ui-checks""></i>';
                break;
            default:
                break;
        }

        if ((element.topics?.length > 0) || (element.criterias?.length > 0))
            childcountbadge = 'badge bg-primary';
        else
            childcountbadge = 'badge bg-secondary';

        html = "";
        html += '<div class="accordion-item">';
        html += `<h2 class="accordion-header" id="panel-heading-${catid}">`;
        html += `<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panel-collapse-${catid}" aria-expanded="${expanded}" aria-controls="panel-collapse-${catid}">`;
        html += icon;
        html += `<div class="p-2">${element.id} | ${element.name}</div><span id="childcount-${catid}" class="${childcountbadge}"></span>`;
        html += "</button>";
        html += "</h2>";
        html += `<div id="panel-collapse-${catid}" class="accordion-collapse ${collapse}" aria-labelledby="panel-heading-${catid}" data-bs-parent="#${accordionid}">`;
        html += `<div id="${bodyid}" class="accordion-body">`;
        html += "</div>";
        html += "</div>";
        html += "</div>";
        div.append(html);
    }
}

function displayTable(name, container) {
    container.html('');

    if (name === "topics") data = model.topics;
    if (name === "criterias") data = model.criterias;

    let $table = $('<table>', {
        id: "dataTable",
        class: "table table-bordered table-sm",
    });

    // Add some headers
    let $thead = $('<thead class="table-light">');
    $thead.append($("<th>", { text: "Id" }));
    $thead.append($("<th>", { text: "Name" }));
    $thead.append($("<th>", { text: "Description" }));

    let $tbody = $("<tbody>");
    for (let i = 0; i < data.length; i++) {
        newTr = $("<tr>");
        newTr.append($("<td>", { text: data[i].id }));
        newTr.append($("<td>", { text: data[i].name }));
        newTr.append($("<td>", { text: data[i].description }));
        $tbody.append(newTr);
    }

    $table.append('<caption>name</caption>');
    $table.append($thead);
    $table.append($tbody);
    let $div = $('<div class="container container-fluid table-responsive"/>');
    $div.append($table);
    container.html($div);
}

$(() => {
    fetchData().then(() => {
        //displayModel($("#modelContainer"));
        displayTable('topics', $('#modelContainer'));
    });
});