// =====================================================================
//  ALEJANDRA RICO PORTFOLIO: ALL EDITABLE CONTENT LIVES IN THIS FILE
//  After editing, run:  node build.mjs   (rebuilds the /site folder)
//  Images live in /site/img/<project-slug>/ (01.webp, 02.webp, ...)
//  Image sizes are read automatically from the files.
// =====================================================================

export const site = {
  name: 'Alejandra Rico',
  fullName: 'Alejandra Rico Gómez',
  role: 'Graphic Designer',
  // Public URL of the live site (used for social sharing previews).
  url: 'https://alejandra-rico-portfolio.vercel.app',
  email: 'aleja.9697@gmail.com',
  linkedin: 'https://www.linkedin.com/in/alexaricogo01/',
  location: 'Vaughan, Ontario',
  description:
    'Alejandra Rico is a graphic designer in the Greater Toronto Area working across visual identity, editorial design, social media and web.',

  heroStatement:
    'Graphic designer for visual identity, editorial and social content. Five years shaping public, institutional and political communication in Cali, Colombia. Now based in the Greater Toronto Area.',

  about: [
    'I am an advertising professional and graphic designer from Cali, Colombia. For five years I designed for public, institutional and political communication: books and newspapers, brand identities, social campaigns, video and print for the street.',
    'That work taught me to turn complex information into design people actually read, to keep a visual system consistent across hundreds of pieces, and to make good decisions fast when deadlines are tight. I bring strategic thinking from advertising together with hands on design and video editing.',
    'I am currently completing a Master of Arts in Digital Media and Global Communications at University of Niagara Falls Canada, and I am growing toward art direction.',
  ],

  // Verified numbers only. Edit carefully.
  impact: [
    { value: '20,000+', label: 'followers on the Secretariat of Economic Development account, up from about 2,000 during the Más Empleos Cali campaign' },
    { value: '30,000+', label: 'Instagram followers for a mayoral campaign, up from about 9,500' },
    { value: '25,000+', label: 'digital interactions with the Mandato Centro book, plus 100 printed copies' },
    { value: '190+', label: 'design assets delivered for Cali City Council' },
  ],

  experience: [
    {
      role: 'Graphic Designer',
      org: 'Cali City Council (Concejo de Cali)',
      place: 'Cali, Colombia',
      points: [
        'Delivered 190+ design assets across digital, editorial, print and event formats.',
        'Designed the Mandato Centro book and two accountability newspapers, about 2,000 copies distributed in downtown Cali.',
        'Created the visual identity for Al Centro Podcast and for the forum POT: Organizing the City, Protecting Life.',
      ],
    },
    {
      role: 'Graphic Designer and Advertising Coordinator',
      org: 'Secretariat of Economic Development, Cali City Hall',
      place: 'Cali, Colombia',
      points: [
        'Led a five person creative team producing graphic and audiovisual content.',
        'Worked on the Más Empleos Cali campaign while the account grew from about 2,000 to 20,000+ followers.',
        'Contributed to Cali Ruge and to the Cali Film Commission website.',
      ],
    },
    {
      role: 'Graphic Designer',
      org: 'Campaign for the Cali Mayor’s Office',
      place: 'Cali, Colombia',
      points: [
        'Built and applied the campaign visual identity across print, digital and video.',
        'Designed 300+ printed and promotional pieces: billboards, flyers, shirts, caps and flags.',
        'The candidate’s Instagram grew from about 9,500 to 30,000+ followers.',
      ],
    },
  ],

  education: [
    { title: 'Master of Arts, Digital Media and Global Communications', org: 'University of Niagara Falls Canada', note: 'In progress' },
    { title: 'Specialization in Advertising Design for Digital Content', org: 'Universidad Autónoma de Occidente, Cali' },
    { title: 'Bachelor in Advertising Communication', org: 'Universidad Autónoma de Occidente, Cali' },
  ],

  capabilities: [
    { title: 'Visual identity', text: 'Logos, color, type and the applications that make a brand recognizable on a hard hat, a menu or a billboard.' },
    { title: 'Editorial design', text: 'Books, newspapers and reports that turn institutional information into clear, readable stories.' },
    { title: 'Social media', text: 'Post systems and campaigns for public institutions, clinics, food brands and agencies.' },
    { title: 'Video and motion', text: 'Editing interviews, reels and campaign videos in Premiere Pro, After Effects and CapCut.' },
    { title: 'Print and POP', text: 'Event pieces, posters, merchandise and large format for the street.' },
    { title: 'Web and UX', text: 'Interface design for public service websites that simplify a process.' },
  ],

  tools: ['Adobe Illustrator', 'Adobe Photoshop', 'Adobe Premiere Pro', 'Adobe After Effects', 'Adobe Lightroom', 'Figma', 'CapCut', 'Canva', 'Microsoft Office'],
  languages: ['Spanish, native', 'English, professional working'],
};

// ---------------------------------------------------------------------
//  HOME PAGE GRID: rows of [project slug, column span out of 12]
// ---------------------------------------------------------------------
export const homeRows = [
  [['al-centro', 7], ['mandato-centro', 5]],
  [['energizar', 4], ['jca', 4], ['fornatta', 4]],
  [['accountability-report-2025', 5], ['music-film-events', 7]],
  [['social-media', 7], ['accountability-report-2024', 5]],
  [['cali-film-commission', 12]],
];

// ---------------------------------------------------------------------
//  PROJECTS
//  gallery: rows of image numbers (1 = 01.webp). Images in one row
//  share the same height automatically.
//  cover: image number used on the home page. coverPosition: CSS object-position.
// ---------------------------------------------------------------------
export const projects = [
  {
    slug: 'al-centro',
    title: 'Al Centro Podcast',
    discipline: 'Visual identity',
    year: '2024',
    client: 'Cali City Council',
    role: 'Visual identity, promotional graphics',
    tools: ['Adobe Illustrator', 'Adobe Photoshop'],
    summary: 'An identity for a podcast about the people and organizations moving downtown Cali forward.',
    sections: [
      ['Brief', 'Al Centro Podcast highlights people and organizations with a real impact on downtown Cali, focusing on the economic, cultural and social movement around the city center. Each episode is recorded in a different urban setting connected to downtown.'],
      ['Approach', 'A brand that reflects the essence, diversity and energy of the area. Stacked, playful lettering sits over street photography, and oversized letterforms frame guests, so every cover, thumbnail and shirt reads as part of the same city.'],
      ['Result', 'A contemporary identity applied across episode covers, video thumbnails, merchandise and outdoor mockups.'],
    ],
    palette: ['#E66D1F', '#161616', '#DCCFAB'],
    cover: 1,
    reveal: 5,
    coverPosition: '50% 48%',
    gallery: [[1, 2, 3], [4, 5]],
    alts: [
      'Al Centro Podcast logo over a downtown Cali street scene',
      'Guest seated in an armchair framed by large orange letterforms',
      'Black t-shirt printed with the Al Centro Podcast logo',
      'Episode thumbnail with bold orange headline and two hosts',
      'Episode posters displayed on billboards in a station corridor',
    ],
  },
  {
    slug: 'energizar',
    title: 'Energizar',
    discipline: 'Rebrand',
    year: '2025',
    client: 'Energizar',
    role: 'Research, rebrand, brand applications',
    tools: ['Adobe Illustrator', 'Adobe Photoshop'],
    summary: 'A subtle rebrand for a Colombian energy distribution company with more than 40 years in business.',
    sections: [
      ['Brief', 'Energizar provides energy distribution solutions for the commercial and construction sectors in Valle del Cauca and across Colombia. The goal was to modernize the identity while keeping the elements people already recognize: an evolution, not a reset.'],
      ['Approach', 'I interviewed the owner one on one to understand his needs and expectations, then researched how energy and energy waves are represented visually. Concentric rings around the lowercase e carry that idea of force and expansion into the new mark.'],
      ['Result', 'A cleaner, more modern brand that communicates better on social media and holds up on site, from hard hats and uniforms to buildings and flags.'],
    ],
    palette: ['#018087', '#63BBB5', '#C9FFEB', '#D3D3D3'],
    cover: 6,
    reveal: 3,
    coverPosition: '50% 55%',
    gallery: [[1, 2, 3], [4, 5]],
    alts: [
      'Energizar symbol: a lowercase e inside concentric rings on mint green',
      'Teal hard hat with the Energizar wordmark',
      'Worker in a teal uniform and hard hat seen from behind',
      'Energizar signage on an industrial building',
      'Energizar flags against a blue sky',
      'Four Energizar rebrand flags against a bright blue sky',
    ],
  },
  {
    slug: 'jca',
    title: 'JCA Hydraulic and Hydrologic Engineering',
    shortTitle: 'JCA Engineering',
    discipline: 'Visual identity',
    year: '2026',
    client: 'JCA Ingeniería Hidráulica e Hidrología',
    role: 'Brand identity, applications',
    tools: ['Adobe Illustrator', 'Adobe Photoshop'],
    summary: 'A precise, confident identity for an engineering firm working on water management and flood risk.',
    sections: [
      ['Brief', 'JCA delivers technical solutions for water management, drainage systems, flood risk and infrastructure planning. The brand needed to communicate precision, trust and expertise.'],
      ['Approach', 'A professional visual language with graphic elements inspired by water flow and engineering analysis. A sharp, angular monogram in signal orange pairs with deep navy and electric blue.'],
      ['Result', 'An identity system shown on uniforms, equipment, hoardings and billboards.'],
    ],
    palette: ['#F75514', '#0D1A62', '#2E2EDF', '#F4F5D2'],
    cover: 1,
    reveal: 2,
    coverPosition: '100% 50%',
    gallery: [[1, 2, 3], [4, 5]],
    alts: [
      'JCA monogram in cream on a signal orange square',
      'Engineer in a JCA jacket beside yellow machinery',
      'Construction site hoarding with JCA branding',
      'Blue JCA billboard on a city street',
      'Large JCA banner on a concrete building',
    ],
  },
  {
    slug: 'fornatta',
    title: 'Fornatta Pizza',
    discipline: 'Visual identity',
    year: '2026',
    client: 'Fornatta',
    role: 'Brand identity, menu, packaging',
    tools: ['Adobe Illustrator', 'Adobe Photoshop'],
    summary: 'A warm Italian identity for a wood fired pizzeria in Niagara Falls.',
    sections: [
      ['Brief', 'Fornatta brings an authentic Italian pizza experience to Niagara Falls, a different option from the American style pizza common in the area. The brand centers on quality ingredients and wood fired preparation.'],
      ['Approach', 'A classic serif wordmark, deep tomato reds and a warm cream inspired by Italian tradition. The goal is more than food: a welcoming place that connects people with the flavor and atmosphere of Italian pizza.'],
      ['Result', 'An identity applied to the menu, pizza boxes, staff shirts, tote bags and street signage ahead of opening.'],
    ],
    palette: ['#5E0006', '#8F0F06', '#C83D0F', '#E1CDAC'],
    cover: 6,
    coverPosition: '50% 40%',
    gallery: [[1], [2, 3], [4, 5, 6]],
    alts: [
      'Fornatta Pizza wordmark over a wood fired oven',
      'Fornatta menu card on a table of pizzas',
      'Pizzas on a table with Ciao and Coming soon tags',
      'Staff member in a red Fornatta shirt',
      'Red Fornatta tote bag with the oven illustration',
      'Fornatta sidewalk sign',
    ],
  },
  {
    slug: 'mandato-centro',
    title: 'Mandato Centro',
    discipline: 'Editorial design',
    year: '2024',
    client: 'Cali City Council',
    role: 'Editorial design and layout',
    tools: ['Adobe Illustrator', 'Adobe Photoshop'],
    summary: 'A book that makes a plan for downtown Cali easy to read and understand.',
    links: [{ label: 'View publication', href: 'https://bit.ly/MandatoCentro' }],
    sections: [
      ['Brief', 'Mandato Centro is a collective initiative for the recovery and transformation of downtown Cali, gathering proposals on urban renewal, public space, mobility, safety, infrastructure, economic activity and social development.'],
      ['Approach', 'I designed and laid out a book that makes each problem and its proposed solution easy to follow. Working closely with the strategy team over one month, I balanced the graphic goals with the purpose and message behind the project.'],
      ['Result', '100 printed copies distributed in spaces tied to urban development, infrastructure, tourism and public space, and more than 25,000 interactions with the digital version.'],
    ],
    cover: 4,
    reveal: 1,
    coverPosition: '50% 50%',
    gallery: [[1], [2, 3], [4, 5]],
    alts: [
      'Close up of the Mandato Centro book cover',
      'Open spread of Mandato Centro with orange headlines',
      'Hands holding the book open to a chapter on the economy',
      'Mandato Centro book lying on a grey surface',
      'Blue and green spread about public services',
    ],
  },
  {
    slug: 'accountability-report-2024',
    title: 'Accountability Report 2024',
    discipline: 'Editorial design',
    year: '2025',
    client: 'Cali City Council',
    role: 'Newspaper design and layout',
    tools: ['Adobe Illustrator', 'Adobe Photoshop'],
    summary: 'A newspaper that turns a councilman’s first year in office into a clear, engaging read.',
    links: [{ label: 'View publication', href: 'https://bit.ly/2024AccountabilityReport' }],
    sections: [
      ['Brief', 'Present the main achievements of Edison Giraldo’s first year on Cali City Council: downtown revitalization, local commerce, public space, mobility, community support and political oversight.'],
      ['Approach', 'Turn an institutional report into an accessible product. Bold typography, photography, structured information and campaign inspired graphics communicate impact directly and memorably.'],
      ['Result', 'Together with the 2025 edition, about 2,000 copies distributed in downtown Cali.'],
    ],
    cover: 2,
    coverPosition: '50% 40%',
    gallery: [[1], [2, 3], [4, 5, 6]],
    alts: [
      'Shoppers reading the newspaper in a downtown store',
      'Hand opening the 2024 accountability newspaper',
      'Shop owner reading the newspaper among merchandise',
      'Close up of hands holding the newspaper',
      'Two men reading the newspaper at a market stall',
      'Vendor reading the newspaper on the street',
    ],
  },
  {
    slug: 'accountability-report-2025',
    title: 'Accountability Report 2025',
    discipline: 'Editorial design',
    year: '2026',
    client: 'Cali City Council',
    role: 'Newspaper design and layout',
    tools: ['Adobe Illustrator', 'Adobe Photoshop'],
    summary: 'The second edition: bolder color, expressive type and data focused on the territory.',
    links: [{ label: 'View publication', href: 'https://bit.ly/2025AccountabilityReport' }],
    sections: [
      ['Brief', 'Present Edison Giraldo’s 2025 progress: downtown revitalization, local business support, community initiatives, public space improvements and political oversight.'],
      ['Approach', 'Expressive typography, vibrant color, photography and key data, organized so institutional results read as a clear, approachable and territory focused publication.'],
      ['Result', 'Together with the 2024 edition, about 2,000 copies distributed in downtown Cali.'],
    ],
    cover: 2,
    coverPosition: '50% 50%',
    gallery: [[1], [2, 3], [4, 5]],
    alts: [
      'Open spread of the 2025 newspaper in red and blue',
      'Hands holding the 2025 accountability newspaper',
      'Newspapers stacked on a woven tray',
      'The newspaper posted on a graffiti covered wall',
      'Several copies fanned out on a table',
    ],
  },
  {
    slug: 'music-film-events',
    title: 'Music and Film Event Design',
    shortTitle: 'Music and Film Events',
    discipline: 'Print and events',
    year: '2025',
    client: 'Secretariat of Economic Development, Cali City Hall',
    role: 'Event identity, print and promotional design',
    tools: ['Adobe Illustrator', 'Adobe Photoshop'],
    summary: 'Printed pieces for events and initiatives in Cali’s music and film sectors, including Cali Ruge.',
    sections: [
      ['Brief', 'Promote cultural activities and support local creative industries with materials for events connected to the city’s music and film sectors, including Cali Ruge, an initiative that showcases emerging artistic talent.'],
      ['Approach', 'Give each event its own identity through clear, engaging editorial and promotional design, from street posters to packaging and collectible cards.'],
      ['Result', 'A family of printed pieces used at events and in public space across the city.'],
    ],
    cover: 1,
    reveal: 5,
    coverPosition: '50% 35%',
    gallery: [[1, 2, 3], [4, 5]],
    alts: [
      'Cali Ruge poster in a street kiosk',
      'Stacks of Cali Ruge cassette tape packaging',
      'Purple promotional boxes reading Está listo',
      'Group of event participants holding printed pieces',
      'Illustrated cards scattered on a table',
    ],
  },
  {
    slug: 'social-media',
    title: 'Social Media',
    discipline: 'Social media',
    year: 'Various',
    client: 'Seven brands and institutions',
    role: 'Content design, campaign graphics',
    tools: ['Adobe Illustrator', 'Adobe Photoshop'],
    summary: 'Post systems for public institutions, a dental clinic, an agency, a vet and a food brand.',
    sections: [
      ['Brief', 'Each account needed a recognizable look that could carry a steady stream of announcements, tips and campaigns without feeling repetitive.'],
      ['Approach', 'A consistent system per brand (type, color, photo treatment and layout) varied post by post, so each feed reads as one voice.'],
      ['Result', 'For the Secretariat of Economic Development, I led a five person creative team, and the account grew from about 2,000 to more than 20,000 followers with campaigns like Más Empleos Cali.'],
    ],
    groups: [
      { key: 'social-cali-city-hall', name: 'Cali City Hall', note: 'Secretariat of Economic Development' },
      { key: 'social-edison-giraldo', name: 'Edison Giraldo', note: 'Santiago de Cali councilman' },
      { key: 'social-youth-council', name: 'Municipal Youth Council', note: 'Cali City Hall' },
      { key: 'social-andina-dental', name: 'Andina Dental', note: 'Dental clinic' },
      { key: 'social-la-colina', name: 'La Colina Estudio', note: 'Advertising agency' },
      { key: 'social-pets-services', name: 'Pet’s Services', note: 'Veterinary clinic' },
      { key: 'social-pulpas-rico', name: 'Pulpas Rico', note: 'Fruit pulps' },
    ],
    coverImage: 'img/social-media/cover.webp',
    coverFit: 'contain',
  },
  {
    slug: 'cali-film-commission',
    title: 'Cali Film Commission',
    discipline: 'Web and UX',
    year: '2025',
    client: 'Secretariat of Economic Development, Cali City Hall',
    role: 'Website design',
    tools: [],
    summary: 'A website that makes it easier to get a permit to film in Cali’s public space.',
    sections: [
      ['Brief', 'Cali Film connects audiovisual producers with the opportunities, benefits and incentives for filming in the city. Getting permission to shoot in public space meant several forms and offices.'],
      ['Approach', 'The site explains the process step by step: what to do, which forms to download, when and where to apply, exemptions, a fee calculator and a timeline of the request, in a bold, colorful system tied to the city.'],
      ['Result', 'One place that brings filming procedures together and promotes Cali as a destination for national and international productions.'],
    ],
    cover: 1,
    coverPosition: '50% 50%',
    gallery: [[1], [2, 3]],
    alts: [
      'Cali Film Commission website on a laptop',
      'Full length view of the website home page',
      'Full length view of the process and timeline sections',
    ],
  },
];
