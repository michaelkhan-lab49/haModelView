const urls = [
    "./json/domains.json",
    "./json/areas.json",
    "./json/topics.json",
    "./json/criterias.json",
];


const maturities = [
    'Establishing',
    'Initial',
    'Developing',
    'Defined',
    'Measurable',
    'Optimizing',
];

var model = {
    domains: {},
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
            maturityLevelText: `${maturities[item.versions[0].maturityLevel]} (L${item.versions[0].maturityLevel})`,
            name: item.name,
            topicId: item.topic ? item.topic.id : item.topicId,
            topicName: item.topic ? item.topic.name : null,
        };
    });

    return result;
}

function sortTopics(topics) {
    let sortedTopics = topics.sort(function (a, b) {
        let a1 = a.areaName + a.name;
        let b1 = b.areaName + b.name;

        return +(a1 > b1) || +(a1 === b1) - 1;
    });

    return sortedTopics;
}


function sortCriterias(criterias) {
    let sortedCriterias = criterias.sort(function (a, b) {
        let a1 = a.topicName + a.maturityLevel + a.id;
        let b1 = b.topicName + b.maturityLevel + b.id;

        return +(a1 > b1) || +(a1 === b1) - 1;
    });

    return sortedCriterias;
}

const fetchData = async () => {
    try {
        let res = await Promise.all(urls.map((e) => fetch(e)));
        let resJson = await Promise.all(res.map((e) => e.json()));
        resJson = resJson.map((e) => e.results);

        model.domains = resJson[0];

        model.topics = resJson[2].map((item) => {
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

        model.areas = resJson[1].map((item) => {
            return {
                id: item.id,
                name: item.name,
                description: item.description,
                domainId: item.domain.id,
                domainName: item.domain.name,
                topics: model.topics.filter(t => t.areaId === item.id),
            };
        });

        model.criterias = reduceCriterias(resJson[3]);

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

function displayTopicsTable(data) {
    let container = $("#modelContainer");
    container.html('');

    data.sort(function (a, b) {
        return +(a.areaName + a.name > b.areaName + b.name) || +(a.areaName + a.name === b.areaName + b.name) - 1;
    });

    //container.append($('<h4>', { class: 'text-capitalize', text: name }));

    let $table = $('<table id="dataTable" class="table table-bordered table-sm table-hover"/>');

    // Add some headers
    let $thead = $('<thead class="table-light">');
    $thead.append($("<th>", { text: "Id" }));
    $thead.append($("<th>", { text: "Area" }));
    $thead.append($("<th>", { text: "Name" }));
    $thead.append($("<th>", { text: "Description" }));

    let $tbody = $('<tbody class="table-group-divider">');
    for (let i = 0; i < data.length; i++) {
        newTr = $("<tr>");
        newTr.append($("<td>", { text: data[i].id }));
        newTr.append($("<td>", { text: data[i].areaName }));
        newTr.append($("<td>", { text: data[i].name }));
        newTr.append($("<td>", { text: data[i].description }));
        $tbody.append(newTr);
    }

    //$table.append('<caption>name</caption>');
    $table.append($thead);
    $table.append($tbody);
    container.append($table);

}

function displayCriteriasTable(data) {
    let container = $("#modelContainer");
    container.html('');

    data.sort(function (a, b) {
        return +(a.topicName + a.maturityLevel > b.topicName + b.maturityLevel) || +(a.topicName + a.maturityLevel === b.topicName + b.maturityLevel) - 1;
    });

    //container.append($('<h4>', { class: 'text-capitalize', text: name }));

    let $table = $('<table id="dataTable" class="table table-bordered table-sm table-hover"/>');

    // Add some headers
    let $thead = $('<thead class="table-light">');
    $thead.append($('<th>', { text: "Id" }));
    $thead.append($('<th>', { text: "Name" }));
    $thead.append($('<th>', { text: "Topic", class: "text-center" }));
    $thead.append($('<th>', { text: "Maturity Level", class: "text-center" }));
    $thead.append($('<th>', { text: "Version", class: "text-center" }));

    let $tbody = $('<tbody class="table-group-divider">');
    for (let i = 0; i < data.length; i++) {
        newTr = $("<tr>");
        newTr.append($('<td>', { text: data[i].id }));
        newTr.append($('<td>', { text: data[i].name }));
        newTr.append($('<td>', { text: data[i].topicName, class: "text-center" }));
        newTr.append($('<td>', { text: `${maturities[data[i].maturityLevel]} (L${data[i].maturityLevel})`, class: "text-center" }));
        newTr.append($('<td>', { text: data[i].versionId, class: "text-center" }));
        $tbody.append(newTr);
    }

    //$table.append('<caption>name</caption>');
    $table.append($thead);
    $table.append($tbody);
    container.append($table);

}

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

            let html = "";
            html += '<div class="row">';

            for (let x = 0; x < maturities.length; x++) {
                html += '<div class="col-sm-2 text-center p-2">' + maturities[x] + '</div>';
            }

            html += '</div>';

            for (let r = 0; r < rows; r++) {
                html += '<div class="row">';

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

                    html += '<div class="col-sm-2">';
                    html += `<div class="card ${bgcolor} mb-3 w-30" style="max-width: 20rem; height: 13rem;">`;
                    html += '<div class="card-body">';
                    html += `<p class="card-text text-center" style="font-size: smaller">${name}</p>`;
                    html += "</div>";
                    html += `<div class="card-footer bg-transparent">`;
                    html += `<p class="card-text" style="font-size: smaller">${id}${versionId}</p>`;
                    html += "</div>";
                    html += "</div>";
                    html += "</div>";
                }

                html += `</div>`;
            }

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

    if (name === "areas") data = model.areas;
    if (name === "topics") data = model.topics;
    if (name === "criterias") data = model.criterias;

    container.append($('<h4>', { class: 'text-capitalize', text: name }));

    let $table = $('<table id="dataTable" class="table table-bordered table-sm table-hover"/>');

    // Add some headers
    let $thead = $('<thead class="table-light">');
    $thead.append($("<th>", { text: "Id" }));
    $thead.append($("<th>", { text: "Name" }));
    $thead.append($("<th>", { text: "Description" }));

    let $tbody = $('<tbody class="table-group-divider">');
    for (let i = 0; i < data.length; i++) {
        newTr = $("<tr>");
        newTr.append($("<td>", { text: data[i].id }));
        newTr.append($("<td>", { text: data[i].name }));
        newTr.append($("<td>", { text: data[i].description }));
        $tbody.append(newTr);
    }

    //$table.append('<caption>name</caption>');
    $table.append($thead);
    $table.append($tbody);
    container.append($table);
}

function applyFilterTopics(value) {
    localStorage.setItem('area', value);
    location.reload();
}

function applyFilterCriterias(value) {
    localStorage.setItem('topic', value);
    location.reload();
}

$(() => {
    fetchData();
});