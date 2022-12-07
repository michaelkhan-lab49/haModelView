const urlsv2 = [
    './jsonv2/availability.json',
    './jsonv2/engineering.json',
    './jsonv2/incident-management.json',
    './jsonv2/maintainability.json',
    './jsonv2/monitoring.json',
    './jsonv2/scalability.json',
    './jsonv2/sdlc-process.json',
];

var modelv2 = {
    domains: [],
    areas: [],
    topics: [],
    criterias: [],
};

const fetchDatav2 = async () => {
    try {
        let res = await Promise.all(urlsv2.map((e) => fetch(e)));
        let resJson = await Promise.all(res.map((e) => e.json()));
        //resJson = resJson.map((e) => e.results);
        console.log(resJson);

        for (let i = 0; i < resJson.length; i++) {
            const element = resJson[i];
            console.log(element);
        }

        modelv2.topics = resJson

        modelv2.topics = modelv2.topics.map((item) => {
            return {
                _id: item._id,
                id: item._id,
                name: item.name,
                description: item.description,
                domain: item.domain,
                area: item.area,
                components: item.components,
                criterias: reduceComponentCriterias(item),
            };
        }).sort((a, b) => a.name.localeCompare(b.name));

        modelv2.domains = resJson.map((item) => {
            return { name: item.domain };
        });

        modelv2.areas = resJson.map((item) => {
            return {
                name: item.area,
            };
        }).sort((a, b) => a.name.localeCompare(b.name));

        modelv2.areas = [
            ...new Map(modelv2.areas.map((item) => [item["name"], item])).values(),
        ];

        modelv2.areas = modelv2.areas.map((item) => {
            return {
                name: item.name,
                topics: resJson.filter(t => t.area === item.name),
            };
        });

        modelv2.criterias = resJson.reduce((prev, next) => {
            let crs = reduceComponentCriterias(next);
            return prev.concat(crs);
        }, []);

        console.log(modelv2);

    } catch (err) {
        console.log(err);
    }
};

function reduceComponentCriterias(topic) {
    try {
        return topic.components.reduce((prev, next) => {
            let comp = next;
            let criteria = next.criteria.map((item) => {
                return {
                    _id: item._id,
                    id: item._id,
                    version: 0,
                    maturityLevel: maturityLevel(item.maturityLevel),
                    maturityLevelText: maturityText(item.maturityLevel),
                    name: item.name,
                    topic: topic.name,
                    component: comp.name,
                    sort: (topic.name ? topic.name : '') + comp.name + maturityLevel(item.maturityLevel),
                };
            });
            return prev.concat(criteria);
        }, []);
    } catch (error) {
        console.error(error);
    }
}

$(async () => {
    $("#navbar").load("navbar.html");

    await fetchDatav2();

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
});


