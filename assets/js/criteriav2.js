$(async () => {
    let topic = localStorage.getItem("topic");
    let maturityLevel = Number(localStorage.getItem("maturityLevel"));

    if (topic === "null" || topic === "undefined") topic = "";

    await fetchData().then(() => {
        let html =
            '<li><a class="dropdown-item" href="javascript:void(0);" onclick="applyFilterCriteriaByTopic(null);">(All)</a></li>';

        for (let i = 0; i < modelv2.topics.length; i++) {
            const item = modelv2.topics[i].name;
            const crs = modelv2.topics[i].criterias.length;
            let active = "";
            let aria = "";
            if (item === topic) {
                active = " active";
                aria = ' aria-current="true"';
            }

            html += `<li><a class="dropdown-item${active}"${aria} href="javascript:void(0);" onclick="applyFilterCriteriaByTopic('${item}');">${item} (${crs})</a></li>`;
        }
        $("#dditems").html(html);

        let criterias = modelv2.criterias;

        if (topic && topic.length > 0)
            criterias = criterias.filter((c) => c.topic === topic);

        if (maturityLevel >= 0)
            criterias = criterias.filter(
                (c) => c.maturityLevel === maturityLevel
            );

        //criterias = sortCriterias(criterias);
        criterias.sort((a, b) => a.sort.localeCompare(b.sort));

        html = `${topic} <span class="badge text-bg-secondary">${criterias.length}</span>`;
        $("#selectedtopic").html(html);

        if (maturityLevel >= 0) {
            html = `${maturityText(
                maturityLevel
            )} <span class="badge text-bg-secondary">${criterias.length
                }</span>`;
            $("#selectedmaturity").html(html);
        }

        $("#dataTable").bootstrapTable({ data: criterias });
    })();
})();

const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
);
const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
);