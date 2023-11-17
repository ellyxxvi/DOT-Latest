
// FOOTER DYNAMIC CONTENTS
const footerSections = [
    {
        title: "About",
        description:""
    },
    {
        title: "Categories",
        links: [
            { title: "Dive", url: "explore_main.php" },
            { title: "Nature", url: "explore_main.php" },
            { title: "Beach", url: "explore_main.php" },
            { title: "Adventure", url: "#explore_main.php" },
            { title: "Festival", url: "calendar.php" }
        ]
    },
    {
        title: "Quick Links",
        links: [
            { title: "Let's Explore", url: "explore_main.php" },
            { title: "Where to Go", url: "wheretogo_main.php" },
            { title: "Calendar of Activities", url: "calendar.php" },
            { title: "Love Our Planet", url: "love_our_planet.php" },
            { title: "Favorites", url: "itinerary_favorites.php" }
        ]
    }
];

function generateFooterContent() {
    const footerContentContainer = document.getElementById("footer-content");

    footerSections.forEach((section, index) => {
        const col = document.createElement("div");

        if (index === 0) {
            col.classList.add("col-xs-6", "col-md-6");
        } else {
            col.classList.add("col-xs-6", "col-md-3");
        }

        const sectionTitle = document.createElement("h6");
        sectionTitle.textContent = section.title;

        col.appendChild(sectionTitle);

        if (section.description !== undefined) {
            const sectionContent = document.createElement("p");
            sectionContent.classList.add("text-justify");
            sectionContent.id = "description"; 
            sectionContent.textContent = section.description;
            col.appendChild(sectionContent);
        }

        if (section.links) {
            const linkList = document.createElement("ul");
            linkList.classList.add("footer-links");

            section.links.forEach(link => {
                const listItem = document.createElement("li");
                const anchor = document.createElement("a");
                anchor.href = link.url;
                anchor.textContent = link.title;
                listItem.appendChild(anchor);
                linkList.appendChild(listItem);
            });

            col.appendChild(linkList);
        }

        footerContentContainer.appendChild(col);
    });
}

function updateFooterAboutContent(description) {
    const aboutElement = document.getElementById('description');
    aboutElement.textContent = description;

    footerSections[0].description = description;
}

fetch(`${API_PROTOCOL}://${API_HOSTNAME}/footer`)
  .then(response => response.json())
  .then(data => {
    const description = data[0].description;
    updateFooterAboutContent(description);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });

generateFooterContent();