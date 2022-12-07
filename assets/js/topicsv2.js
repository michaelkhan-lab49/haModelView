$(async () => {
    let area = localStorage.getItem("area");

    if (area === "null" || area === "undefined") area = "";

    await fetchData().then(() => {
        let html = `<li><a class="dropdown-item" href="javascript:void(0);" onclick="applyFilterTopics(null);">(All)</a></li>`;

        for (var i = 0; i < modelv2.areas.length; i++) {
            const item = modelv2.areas[i].name;
            const tops = modelv2.areas[i].topics.length;
            let active = "";
            let aria = "";
            if (item === area) {
                active = " active";
                aria = ' aria-current="true"';
            }

            html += `<li><a class="dropdown-item${active}" ${aria} href="javascript:void(0);" onclick="applyFilterTopics('${item}');">${item} (${tops})</a></li>`;
        }
        $("#dditems").html(html);

        let topics = modelv2.topics;
        console.log(topics);
        if (area && area.length > 0)
            topics = topics.filter((t) => t.area === area);
        topics = sortTopics(topics);

        html = `${area} <span class="badge text-bg-secondary">${topics.length}</span>`;

        $("#selecteditem").html(html);
        $("#dataTable").bootstrapTable({ data: topics });
    })();
})();

const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
);
const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
);