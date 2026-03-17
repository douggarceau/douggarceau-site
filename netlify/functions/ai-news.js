const SOURCES = [
   { name: 'Visit New England Events', ... },
   ...
];const SOURCES = [
  // =========================
  // REGIONAL / ALL NEW ENGLAND
  // =========================
  { name: 'Visit New England Events', type: 'html', category: 'regional', url: 'https://www.visitnewengland.com/all/events/events/' },
  { name: 'Visit New England Fairs & Festivals', type: 'html', category: 'festivals', url: 'https://www.visitnewengland.com/all/fairs-and-festivals/' },
  { name: 'New England Concerts Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=New+England+concerts+live+music&hl=en-US&gl=US&ceid=US:en' },
  { name: 'New England Festivals Search', type: 'rss', category: 'festivals', url: 'https://news.google.com/rss/search?q=New+England+festivals+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'New England Weekend Events Search', type: 'rss', category: 'weekend', url: 'https://news.google.com/rss/search?q=New+England+this+weekend+events&hl=en-US&gl=US&ceid=US:en' },

  // =========================
  // MASSACHUSETTS / BOSTON
  // =========================
  { name: 'Meet Boston Events', type: 'html', category: 'boston', url: 'https://www.meetboston.com/events/' },
  { name: 'Visit Massachusetts Events', type: 'html', category: 'massachusetts', url: 'https://www.visit-massachusetts.com/state/events/events/' },
  { name: 'ArtsBoston Calendar', type: 'html', category: 'boston', url: 'https://www.artsboston.org/abcalendar/' },
  { name: 'Crossroads Presents Events', type: 'html', category: 'music', url: 'https://crossroadspresents.com/pages/events' },
  { name: 'Roadrunner Calendar', type: 'html', category: 'music', url: 'https://roadrunnerboston.com/calendar/' },
  { name: 'Roadrunner Shows', type: 'html', category: 'music', url: 'https://www.bowerypresents.com/shows/roadrunner' },
  { name: 'House of Blues Boston', type: 'html', category: 'music', url: 'https://boston.houseofblues.com/shows' },
  { name: 'Citizens Opera House', type: 'html', category: 'music', url: 'https://citizensbankoperahouse.com/' },
  { name: 'Brighton Music Hall', type: 'html', category: 'music', url: 'https://crossroadspresents.com/pages/brighton-music-hall' },
  { name: 'Paradise Rock Club', type: 'html', category: 'music', url: 'https://crossroadspresents.com/pages/paradise-rock-club' },
  { name: 'MGM Music Hall at Fenway', type: 'html', category: 'music', url: 'https://crossroadspresents.com/pages/mgm-fenway-music-hall-inner' },
  { name: 'Boston Concerts Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Boston+concerts+tonight&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Boston Live Music Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Boston+live+music+this+weekend&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Fenway Events Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Fenway+concerts+events+Boston&hl=en-US&gl=US&ceid=US:en' },
  { name: 'TD Garden Events Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=TD+Garden+concerts+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Boston Calling Search', type: 'rss', category: 'festivals', url: 'https://news.google.com/rss/search?q=Boston+Calling+festival&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Cambridge Events Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Cambridge+MA+concerts+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Somerville Events Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Somerville+MA+live+music+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Worcester Events Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Worcester+MA+concerts+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Lowell Events Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Lowell+MA+events+concerts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Salem Events Search', type: 'rss', category: 'weekend', url: 'https://news.google.com/rss/search?q=Salem+MA+events+festivals&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Cape Cod Events Search', type: 'rss', category: 'weekend', url: 'https://news.google.com/rss/search?q=Cape+Cod+events+festivals+concerts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'North Shore Events Search', type: 'rss', category: 'weekend', url: 'https://news.google.com/rss/search?q=North+Shore+MA+events+concerts&hl=en-US&gl=US&ceid=US:en' },

  // =========================
  // RHODE ISLAND / PROVIDENCE
  // =========================
  { name: 'GoProvidence Events', type: 'html', category: 'providence', url: 'https://www.goprovidence.com/events/' },
  { name: 'GoProvidence Annual Highlights', type: 'html', category: 'providence', url: 'https://www.goprovidence.com/blog/stories/post/mark-your-calendar-for-providences-cant-miss-events/' },
  { name: 'WaterFire Calendar', type: 'html', category: 'festivals', url: 'https://waterfire.org/event-calendar/' },
  { name: 'WaterFire Arts Center Calendar', type: 'html', category: 'arts', url: 'https://waterfire.org/waterfire-arts-center/waterfire-arts-center-event-calendar/' },
  { name: 'The Met Events', type: 'html', category: 'music', url: 'https://themetri.com/events/' },
  { name: 'Providence Concerts Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Providence+RI+concerts+tonight&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Providence Weekend Search', type: 'rss', category: 'weekend', url: 'https://news.google.com/rss/search?q=Providence+RI+events+this+weekend&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Providence Live Music Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Providence+RI+live+music&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Newport Events Search', type: 'rss', category: 'weekend', url: 'https://news.google.com/rss/search?q=Newport+RI+events+concerts+festivals&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Newport Folk Search', type: 'rss', category: 'festivals', url: 'https://news.google.com/rss/search?q=Newport+Folk+Festival&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Newport Jazz Search', type: 'rss', category: 'festivals', url: 'https://news.google.com/rss/search?q=Newport+Jazz+Festival&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Rhode Island Festivals Search', type: 'rss', category: 'festivals', url: 'https://news.google.com/rss/search?q=Rhode+Island+festivals+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Pawtucket Events Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Pawtucket+RI+events+concerts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Warwick Events Search', type: 'rss', category: 'weekend', url: 'https://news.google.com/rss/search?q=Warwick+RI+events+live+music&hl=en-US&gl=US&ceid=US:en' },
  { name: 'South County RI Events Search', type: 'rss', category: 'weekend', url: 'https://news.google.com/rss/search?q=South+County+RI+events+concerts&hl=en-US&gl=US&ceid=US:en' },

  // =========================
  // CONNECTICUT
  // =========================
  { name: 'CTvisit Events', type: 'html', category: 'connecticut', url: 'https://ctvisit.com/events' },
  { name: 'CTvisit This Weekend', type: 'html', category: 'weekend', url: 'https://ctvisit.com/this-weekend' },
  { name: 'Visit Connecticut Events', type: 'html', category: 'connecticut', url: 'https://www.visitconnecticut.com/state/events/events/' },
  { name: 'Hartford.com Events', type: 'html', category: 'hartford', url: 'https://hartford.com/' },
  { name: 'Hartford Concerts Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Hartford+CT+concerts+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'New Haven Concerts Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=New+Haven+CT+concerts+live+music&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Bridgeport Events Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Bridgeport+CT+concerts+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Stamford Events Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Stamford+CT+concerts+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Norwalk Events Search', type: 'rss', category: 'weekend', url: 'https://news.google.com/rss/search?q=Norwalk+CT+events+concerts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Mohegan Sun Events Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Mohegan+Sun+concerts+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Foxwoods Events Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Foxwoods+concerts+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Yale / New Haven Arts Search', type: 'rss', category: 'arts', url: 'https://news.google.com/rss/search?q=New+Haven+arts+events+theater+music&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Connecticut Festivals Search', type: 'rss', category: 'festivals', url: 'https://news.google.com/rss/search?q=Connecticut+festivals+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Connecticut Live Music Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Connecticut+live+music+concerts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Shoreline CT Events Search', type: 'rss', category: 'weekend', url: 'https://news.google.com/rss/search?q=Connecticut+shoreline+events+concerts&hl=en-US&gl=US&ceid=US:en' },

  // =========================
  // MAINE
  // =========================
  { name: 'Maine Tourism Events', type: 'html', category: 'maine', url: 'https://www.mainetourism.com/events/' },
  { name: 'Visit Maine Festivals & Events', type: 'html', category: 'maine', url: 'https://visitmaine.com/festivals-events/' },
  { name: 'Visit Maine Event Calendar', type: 'html', category: 'maine', url: 'https://visitmaine.com/festivals-events/maine-events-calendar/' },
  { name: 'Maine Concerts & Live Music', type: 'html', category: 'music', url: 'https://www.mainetourism.com/events/concerts-live-music/' },
  { name: 'Greater Portland Events', type: 'html', category: 'portland-me', url: 'https://www.visitportland.com/visit/things-to-do/event-calendar/' },
  { name: 'Portland Maine Concerts Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Portland+Maine+concerts+live+music&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Bangor Events Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Bangor+Maine+events+concerts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Augusta Events Search', type: 'rss', category: 'weekend', url: 'https://news.google.com/rss/search?q=Augusta+Maine+events+concerts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Bar Harbor Events Search', type: 'rss', category: 'weekend', url: 'https://news.google.com/rss/search?q=Bar+Harbor+events+concerts+festivals&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Maine Festivals Search', type: 'rss', category: 'festivals', url: 'https://news.google.com/rss/search?q=Maine+festivals+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Maine Summer Concerts Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Maine+summer+concert+series&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Maine Waterfront Events Search', type: 'rss', category: 'weekend', url: 'https://news.google.com/rss/search?q=Maine+waterfront+events+live+music&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Maine Fairgrounds Search', type: 'rss', category: 'festivals', url: 'https://news.google.com/rss/search?q=Maine+fairgrounds+events+festivals&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Maine Arts Events Search', type: 'rss', category: 'arts', url: 'https://news.google.com/rss/search?q=Maine+arts+events+performing+arts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Maine Food Festival Search', type: 'rss', category: 'festivals', url: 'https://news.google.com/rss/search?q=Maine+food+festival+events&hl=en-US&gl=US&ceid=US:en' },

  // =========================
  // NEW HAMPSHIRE
  // =========================
  { name: 'Visit NH Events Calendar', type: 'html', category: 'new-hampshire', url: 'https://www.visitnh.gov/things-to-do/events-calendar' },
  { name: 'Visit New Hampshire Events', type: 'html', category: 'new-hampshire', url: 'https://www.visit-newhampshire.com/state/events/events/' },
  { name: 'Visit NH Music', type: 'html', category: 'music', url: 'https://www.visitnh.gov/places-to-go/arts-culture/music' },
  { name: 'Visit NH Fairs & Festivals', type: 'html', category: 'festivals', url: 'https://www.visit-newhampshire.com/state/fairs-and-festivals/' },
  { name: 'Portsmouth NH Events Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Portsmouth+NH+events+concerts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Manchester NH Events Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Manchester+NH+concerts+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Nashua NH Events Search', type: 'rss', category: 'weekend', url: 'https://news.google.com/rss/search?q=Nashua+NH+events+concerts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Concord NH Events Search', type: 'rss', category: 'weekend', url: 'https://news.google.com/rss/search?q=Concord+NH+events+concerts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Lakes Region Events', type: 'html', category: 'weekend', url: 'https://www.lakesregion.org/events/' },
  { name: 'Hampton Beach Casino Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Hampton+Beach+Casino+Ballroom+concerts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'BankNH Pavilion Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Bank+of+New+Hampshire+Pavilion+concerts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Prescott Park Search', type: 'rss', category: 'arts', url: 'https://news.google.com/rss/search?q=Prescott+Park+Arts+Festival&hl=en-US&gl=US&ceid=US:en' },
  { name: 'NH Live Music Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=New+Hampshire+live+music+concerts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'NH Festivals Search', type: 'rss', category: 'festivals', url: 'https://news.google.com/rss/search?q=New+Hampshire+festivals+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'White Mountains Events Search', type: 'rss', category: 'weekend', url: 'https://news.google.com/rss/search?q=White+Mountains+NH+events+concerts&hl=en-US&gl=US&ceid=US:en' },

  // =========================
  // VERMONT
  // =========================
  { name: 'Vermont Tourism Events', type: 'html', category: 'vermont', url: 'https://vermontvacation.com/things-to-do/art-culture/events/' },
  { name: 'Vermont Tourism Events Plan', type: 'html', category: 'vermont', url: 'https://plan.vermontvacation.com/events' },
  { name: 'Visit Vermont Events', type: 'html', category: 'vermont', url: 'https://www.visit-vermont.com/state/events/events/' },
  { name: 'Vermont.com Calendar', type: 'html', category: 'vermont', url: 'https://vermont.com/calendar/' },
  { name: 'Vermont Public Events Calendar', type: 'html', category: 'arts', url: 'https://www.vermontpublic.org/vermont-events-calendar' },
  { name: 'Burlington VT Events Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Burlington+VT+concerts+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Montpelier VT Events Search', type: 'rss', category: 'weekend', url: 'https://news.google.com/rss/search?q=Montpelier+VT+events+music&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Stowe VT Events Search', type: 'rss', category: 'weekend', url: 'https://news.google.com/rss/search?q=Stowe+VT+events+festivals+concerts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Mad River Valley Events', type: 'html', category: 'weekend', url: 'https://www.madrivervalley.com/events/' },
  { name: 'Vermont Festivals Search', type: 'rss', category: 'festivals', url: 'https://news.google.com/rss/search?q=Vermont+festivals+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Vermont Live Music Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Vermont+live+music+concerts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Killington Events Search', type: 'rss', category: 'weekend', url: 'https://news.google.com/rss/search?q=Killington+VT+events+concerts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Brattleboro Events Search', type: 'rss', category: 'arts', url: 'https://news.google.com/rss/search?q=Brattleboro+VT+events+music+arts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Woodstock VT Events Search', type: 'rss', category: 'weekend', url: 'https://news.google.com/rss/search?q=Woodstock+VT+events+festivals&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Vermont Summer Festivals Search', type: 'rss', category: 'festivals', url: 'https://news.google.com/rss/search?q=Vermont+summer+festivals+concerts&hl=en-US&gl=US&ceid=US:en' },

  // =========================
  // STADIUMS / ARENAS / CASINOS / BIG ROOMS
  // =========================
  { name: 'TD Garden Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=TD+Garden+concerts+Boston&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Fenway Park Concerts Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Fenway+Park+concerts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Xfinity Center Mansfield Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Xfinity+Center+Mansfield+concerts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Mohegan Sun Arena Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Mohegan+Sun+Arena+concerts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Foxwoods Premier Theater Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Foxwoods+Premier+Theater+concerts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'SNHU Arena Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=SNHU+Arena+concerts+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'BankNH Pavilion Search 2', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=BankNH+Pavilion+Gilford+concerts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Maine Savings Amphitheater Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Maine+Savings+Amphitheater+concerts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Champlain Valley Expo Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Champlain+Valley+Expo+concerts+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Hartford HealthCare Amphitheater Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=Hartford+HealthCare+Amphitheater+concerts&hl=en-US&gl=US&ceid=US:en' },

  // =========================
  // FESTIVAL / EVENT SEARCH FEEDS
  // =========================
  { name: 'Boston Festivals Search', type: 'rss', category: 'festivals', url: 'https://news.google.com/rss/search?q=Boston+festivals+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Providence Festivals Search', type: 'rss', category: 'festivals', url: 'https://news.google.com/rss/search?q=Providence+RI+festivals+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Portland Maine Festivals Search', type: 'rss', category: 'festivals', url: 'https://news.google.com/rss/search?q=Portland+Maine+festivals+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Hartford Festivals Search', type: 'rss', category: 'festivals', url: 'https://news.google.com/rss/search?q=Hartford+CT+festivals+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Burlington Festivals Search', type: 'rss', category: 'festivals', url: 'https://news.google.com/rss/search?q=Burlington+VT+festivals+events&hl=en-US&gl=US&ceid=US:en' },
  { name: 'New England Food Festivals Search', type: 'rss', category: 'festivals', url: 'https://news.google.com/rss/search?q=New+England+food+festivals&hl=en-US&gl=US&ceid=US:en' },
  { name: 'New England Beer Festivals Search', type: 'rss', category: 'festivals', url: 'https://news.google.com/rss/search?q=New+England+beer+festival&hl=en-US&gl=US&ceid=US:en' },
  { name: 'New England Arts Festivals Search', type: 'rss', category: 'festivals', url: 'https://news.google.com/rss/search?q=New+England+arts+festival&hl=en-US&gl=US&ceid=US:en' },
  { name: 'New England Waterfront Events Search', type: 'rss', category: 'weekend', url: 'https://news.google.com/rss/search?q=New+England+waterfront+events+concerts&hl=en-US&gl=US&ceid=US:en' },
  { name: 'New England Summer Concert Series Search', type: 'rss', category: 'music', url: 'https://news.google.com/rss/search?q=New+England+summer+concert+series&hl=en-US&gl=US&ceid=US:en' }
];

exports.handler = async function handler() {

exports.handler = async function handler() {

exports.handler = async function handler() {
  try {
    const [settled, market] = await Promise.all([
      Promise.allSettled(SOURCES.map(fetchSource)),
      fetchMarketSnapshot()
    ]);

    const items = settled
      .flatMap(result => (result.status === 'fulfilled' ? result.value : []))
      .filter(Boolean)
      .filter(item => item.title && item.link)
      .map(cleanItem)
      .filter(item => !isArxivItem(item) || isNotableArxivItem(item))
      .filter(capArxivItems(3))
      .filter(item => isValidArticleLink(item.link))
      .filter(dedupeByLink())
      .sort((a, b) => {
        const priorityDelta = storyPriority(b) - storyPriority(a);
        if (priorityDelta !== 0) return priorityDelta;
        return new Date(b.pubDate || 0) - new Date(a.pubDate || 0);
      })
      .slice(0, 54);

    const sourceCounts = items.reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1;
      return acc;
    }, {});

    const mainstreamHeadlines = items
      .filter(item => ['mainstream', 'finance', 'politics', 'tech'].includes(item.category))
      .slice(0, 16)
      .map(item => ({ title: item.title, link: item.link, source: item.source }));

    const wireHeadlines = items.slice(0, 42).map(item => ({
      title: item.title,
      link: item.link,
      source: item.source,
      category: item.category
    }));

    const researchBreakthroughs = items
      .filter(item => item.category === 'research' || /(paper|preprint|benchmark|experiment|research|breakthrough|model eval|alignment|interpretability|reasoning)/i.test(`${item.title} ${item.summary || ''}`))
      .slice(0, 16)
      .map(item => ({ title: item.title, link: item.link, source: item.source, category: item.category }));

    const darkTech = items
      .filter(item => /(deepfake|synthetic|surveillance|autonomous weapon|weaponized ai|identity theft|voice clone|manipulation|misuse|biohacking|brain[- ]computer)/i.test(`${item.title} ${item.summary || ''}`))
      .slice(0, 16)
      .map(item => ({ title: item.title, link: item.link, source: item.source, category: item.category }));

    const incidentLog = items
      .filter(item => /(incident|failure|hallucination|outage|bug|accident|harm|safety failure|red team|misalignment|breakdown)/i.test(`${item.title} ${item.summary || ''}`))
      .slice(0, 16)
      .map(item => ({ title: item.title, link: item.link, source: item.source, category: item.category }));

    const aiCulture = items
      .filter(item => /(companion|culture|creator|influencer|community|social|podcast|education|student life|lifestyle|digital identity)/i.test(`${item.title} ${item.summary || ''}`))
      .slice(0, 16)
      .map(item => ({ title: item.title, link: item.link, source: item.source, category: item.category }));

    const policyActivity = items
      .filter(item => /ai act|ai policy|ai regulation|model safety policy|executive order ai|governance/i.test(`${item.title} ${item.summary || ''}`))
      .slice(0, 10)
      .map(item => ({
        title: item.title,
        link: item.link,
        source: item.source,
        pubDate: item.pubDate
      }));

    const humanDriftActivity = items
      .filter(item => /(incident|failure|hallucination|deepfake|synthetic|identity|robot|autonomous|drone|surveillance|weapon|defense|attachment|companion|transhuman|enhancement|safety|misuse|breakdown)/i.test(`${item.title} ${item.summary || ''}`))
      .slice(0, 10)
      .map(item => ({
        title: item.title,
        link: item.link,
        source: item.source,
        pubDate: item.pubDate,
        category: item.category
      }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=180'
      },
      body: JSON.stringify({
        generatedAt: new Date().toISOString(),
        items,
        meta: {
          sourceCounts,
          total: items.length,
          mainstreamHeadlines,
          wireHeadlines,
          researchBreakthroughs,
          darkTech,
          incidentLog,
          aiCulture,
          policyActivity,
          humanDriftActivity,
          market
        }
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: error.message })
    };
  }
};

function fetchWithTimeout(url, options = {}, timeoutMs = 6500) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms fetching ${url}`)), timeoutMs);
    fetch(url, options)
      .then(res => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function fetchSource(source) {
  try {
    const response = await fetchWithTimeout(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 AISignals/1.0'
      }
    }, 6500);

    if (!response.ok) {
      throw new Error(`${source.name} returned ${response.status}`);
    }

    const text = await response.text();
    if (source.type === 'rss') return parseRSS(text, source);
    return parseHTML(text, source).slice(0, source.limit || 8);
  } catch (err) {
    console.warn(`Source failed: ${source.name} (${source.url})`, err.message || err);
    return [];
  }
}

function parseRSS(xml, source) {
  const items = [];
  const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
  const entryMatches = xml.match(/<entry>[\s\S]*?<\/entry>/gi) || [];
  const matches = [...itemMatches, ...entryMatches];

  const cap = source.limit || 12;
  for (const chunk of matches.slice(0, cap)) {
    const link = extractRssLink(chunk);
    const summary = extractTag(chunk, 'description') || extractTag(chunk, 'summary') || extractTag(chunk, 'content');
    const pubDate = extractTag(chunk, 'pubDate') || extractTag(chunk, 'updated') || extractTag(chunk, 'published');

    items.push({
      source: source.name,
      category: source.category,
      title: decodeHtml(extractTag(chunk, 'title')),
      link: decodeHtml(link),
      pubDate: normalizeDate(pubDate),
      summary: decodeHtml(stripTags(summary))
    });
  }

  return items;
}

function parseHTML(html, source) {
  const cleaned = html.replace(/\n+/g, ' ');
  const matches = [...cleaned.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const items = [];
  const seen = new Set();

  for (const match of matches) {
    const href = match[1];
    const inner = stripTags(match[2]).replace(/\s+/g, ' ').trim();
    if (!inner || inner.length < 24) continue;
    if (inner.length > 180) continue;
    if (/^(learn more|read more|start building|developer docs|home|news|about)$/i.test(inner)) continue;
    if (!looksLikeArticleUrl(href, source.url)) continue;

    const link = absoluteUrl(href, source.url);
    if (seen.has(link)) continue;
    seen.add(link);

    items.push({
      source: source.name,
      category: source.category,
      title: decodeHtml(inner),
      link,
      pubDate: guessDateNearLink(cleaned, href),
      summary: `${source.name} update pulled from the live source page.`
    });

    if (items.length >= 8) break;
  }

  return items;
}

function looksLikeArticleUrl(href, base) {
  const absolute = absoluteUrl(href, base);
  return /\/((news|blog|engineering|research)\/|20\d{2}|[a-z0-9-]{8,})/i.test(absolute) && !/\/careers|\/about|\/pricing|\/api|\/index|\/news\/?$/i.test(absolute);
}

function guessDateNearLink(html, href) {
  const idx = html.indexOf(href);
  if (idx === -1) return null;
  const nearby = html.slice(Math.max(0, idx - 240), Math.min(html.length, idx + 240));
  const dateMatch = nearby.match(/(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+20\d{2}/i);
  return dateMatch ? normalizeDate(dateMatch[0]) : null;
}

function absoluteUrl(href, base) {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? match[1].trim() : '';
}

function extractRssLink(chunk) {
  const plainLink = extractTag(chunk, 'link');
  if (plainLink) return plainLink;

  const attrLink = chunk.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);
  return attrLink ? attrLink[1] : '';
}

function stripTags(value = '') {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodeHtml(str = '') {
  return str
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8217;/g, '’')
    .replace(/&#8211;/g, '–')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”');
}

function sanitizeHeadline(value = '') {
  return decodeHtml(value)
    .replace(/^\s*(?:\[[^\]]+\]|\{[^\}]+\}|\([A-Z0-9_\-]{2,20}\))\s*/, '')
    .replace(/^\s*(?:code:|id:|tag:)\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function isValidArticleLink(link = '') {
  const l = link.trim();
  if (!l.startsWith('http')) return false;
  // reject feed/channel root URLs (no path beyond a bare slash or feed extension)
  if (/\.(rss|xml|atom)(\?|$)/i.test(l)) return false;
  if (/news\.google\.com\/rss\/search/i.test(l)) return false;
  if (/\/(rss|feed|feeds)(\/|\?|$)/i.test(l)) return false;
  // reject links that are clearly just domain roots
  if (/^https?:\/\/[^/]+(\/)?$/.test(l)) return false;
  // reject anything that looks like raw code or markup leaked into a URL
  if (/<|>|{|}|\[|\]/.test(l)) return false;
  return true;
}

function cleanItem(item) {
  return {
    source: item.source || 'Live Feed',
    category: item.category || 'ai',
    title: sanitizeHeadline(item.title || ''),
    link: (item.link || '').trim(),
    pubDate: item.pubDate || null,
    summary: (item.summary || '').replace(/\s+/g, ' ').trim()
  };
}

function dedupeByLink() {
  const seen = new Set();
  return item => {
    if (seen.has(item.link)) return false;
    seen.add(item.link);
    return true;
  };
}

function storyPriority(item) {
  let score = 0;
  const source = String(item.source || '').toLowerCase();
  const text = `${item.title || ''} ${item.summary || ''}`.toLowerCase();

  if (item.category === 'research') score += 6;
  if (item.category === 'ai') score += 3;

  if (/(arxiv|papers with code|mit technology review ai|mit csail|stanford ai|berkeley ai|carnegie mellon ai|openai research|anthropic research|deepmind research|meta ai research|alignment forum|future of life|center for ai safety)/.test(source)) {
    score += 6;
  }

  if (/(paper|preprint|benchmark|experiment|research|alignment|safety|frontier|breakthrough|model eval|red team|interpretability|reasoning)/.test(text)) {
    score += 4;
  }

  return score;
}

function isArxivItem(item = {}) {
  return /arxiv/i.test(String(item.source || ''));
}

function isNotableArxivItem(item = {}) {
  const text = `${item.title || ''} ${item.summary || ''}`.toLowerCase();

  const notableSignals = /(breakthrough|state[- ]of[- ]the[- ]art|sota|frontier|reasoning|chain[- ]of[- ]thought|test[- ]time compute|agentic|robot|robotic|embodied|manipulation|navigation|safety|alignment|red[- ]team|robustness|jailbreak|emergent|emergence|scaling law|world model|multimodal|tool use|planning)/;
  const lowInterestSignals = /(survey|workshop|tutorial|dataset|benchmark(ing)?|we propose|towards|an approach|preliminary|ablation|appendix|supplementary|short paper)/;

  if (!notableSignals.test(text)) return false;
  if (lowInterestSignals.test(text) && !/(breakthrough|state[- ]of[- ]the[- ]art|reasoning|robot|safety|alignment|emergent)/.test(text)) {
    return false;
  }

  return true;
}

function capArxivItems(maxCount = 3) {
  let count = 0;
  return (item) => {
    if (!isArxivItem(item)) return true;
    if (count >= maxCount) return false;
    count += 1;
    return true;
  };
}

const MARKET_SYMBOLS = [
  { ticker: 'NVDA', name: 'NVIDIA', yahooSymbol: 'NVDA', stooqSymbol: 'nvda.us', link: 'https://finance.yahoo.com/quote/NVDA' },
  { ticker: 'MSFT', name: 'Microsoft', yahooSymbol: 'MSFT', stooqSymbol: 'msft.us', link: 'https://finance.yahoo.com/quote/MSFT' },
  { ticker: 'GOOGL', name: 'Alphabet', yahooSymbol: 'GOOGL', stooqSymbol: 'googl.us', link: 'https://finance.yahoo.com/quote/GOOGL' },
  { ticker: 'META', name: 'Meta', yahooSymbol: 'META', stooqSymbol: 'meta.us', link: 'https://finance.yahoo.com/quote/META' },
  { ticker: 'TSLA', name: 'Tesla', yahooSymbol: 'TSLA', stooqSymbol: 'tsla.us', link: 'https://finance.yahoo.com/quote/TSLA' },
  { ticker: 'AMD', name: 'AMD', yahooSymbol: 'AMD', stooqSymbol: 'amd.us', link: 'https://finance.yahoo.com/quote/AMD' },
  { ticker: 'BTC', name: 'Bitcoin', yahooSymbol: 'BTC-USD', stooqSymbol: null, link: 'https://finance.yahoo.com/quote/BTC-USD' },
  { ticker: 'ETH', name: 'Ethereum', yahooSymbol: 'ETH-USD', stooqSymbol: null, link: 'https://finance.yahoo.com/quote/ETH-USD' }
];

function toAsset(quote, name, ticker, link) {
  if (!quote) return null;
  const price = quote.regularMarketPrice;
  const changePct = quote.regularMarketChangePercent;

  return {
    ticker,
    name,
    price: typeof price === 'number' ? roundNumber(price, 2) : null,
    changePct: typeof changePct === 'number' ? roundNumber(changePct, 2) : null,
    trend: changePct > 0 ? 'UP' : changePct < 0 ? 'DOWN' : 'FLAT',
    link
  };
}

function average(values) {
  const valid = values.filter(v => typeof v === 'number' && Number.isFinite(v));
  if (!valid.length) return 0;
  return valid.reduce((sum, v) => sum + v, 0) / valid.length;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function roundNumber(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

async function fetchMarketSnapshot() {
  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${MARKET_SYMBOLS.map(s => s.yahooSymbol).join(',')}`;
    const response = await fetchWithTimeout(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 AISignals/1.0',
        'Accept': 'application/json'
      }
    }, 5000);

    let assets = [];
    if (response.ok) {
      const data = await response.json();
      const quotes = Array.isArray(data?.quoteResponse?.result) ? data.quoteResponse.result : [];
      const quoteBySymbol = new Map(quotes.map(q => [String(q.symbol || '').toUpperCase(), q]));

      assets = MARKET_SYMBOLS
        .map(symbol => toAsset(quoteBySymbol.get(symbol.yahooSymbol), symbol.name, symbol.ticker, symbol.link))
        .filter(asset => asset && typeof asset.price === 'number');
    }

    if (assets.length < 3) {
      assets = await fetchMarketSnapshotFallback();
    }

    if (!assets.length) return null;

    const pulseValue = roundNumber(average(assets.map(a => a.changePct)), 2);
    const pulse = pulseValue > 0.35 ? 'BULLISH' : pulseValue < -0.35 ? 'BEARISH' : 'FLAT';

    return {
      pulse,
      pulseValue,
      assets,
      indexLinks: [
        { name: 'NASDAQ Composite', link: 'https://finance.yahoo.com/quote/%5EIXIC' },
        { name: 'QQQ ETF', link: 'https://finance.yahoo.com/quote/QQQ' }
      ],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Market snapshot failed:', error.message);
    return null;
  }
}

async function fetchMarketSnapshotFallback() {
  try {
    const stooqSymbols = MARKET_SYMBOLS.filter(s => s.stooqSymbol).map(s => s.stooqSymbol).join(',');
    const response = await fetchWithTimeout(
      `https://stooq.com/q/l/?s=${stooqSymbols}&f=sd2t2ohlcv&h&e=csv`,
      { headers: { 'User-Agent': 'Mozilla/5.0 AISignals/1.0' } },
      5000
    );

    if (!response.ok) return [];

    const csv = await response.text();
    const rows = csv.split(/\r?\n/).filter(Boolean).slice(1);
    const symbolByStooq = new Map(
      MARKET_SYMBOLS
        .filter(s => s.stooqSymbol)
        .map(s => [s.stooqSymbol.toUpperCase(), s])
    );

    return rows.map(row => {
      const cols = row.split(',');
      const symbol = String(cols[0] || '').trim().toUpperCase();
      const config = symbolByStooq.get(symbol);
      if (!config) return null;

      const open = toNumber(cols[3]);
      const close = toNumber(cols[6]);
      if (close == null) return null;

      const changePct = open && open > 0 ? roundNumber(((close - open) / open) * 100, 2) : null;

      return {
        ticker: config.ticker,
        name: config.name,
        price: roundNumber(close, 2),
        changePct,
        trend: changePct > 0 ? 'UP' : changePct < 0 ? 'DOWN' : 'FLAT',
        link: config.link
      };
    }).filter(Boolean);
  } catch {
    return [];
  }
}
