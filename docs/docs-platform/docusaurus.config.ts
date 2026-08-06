import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Simplicion Academy',
  tagline: 'Career and Business Operating System',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://academy.simplicion.com',
  baseUrl: '/',

  organizationName: 'simplicion',
  projectName: 'simplicion-academy',

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Simplicion Academy',
      logo: {
        alt: 'Simplicion Academy Logo',
        src: 'img/logo-black.svg',
        srcDark: 'img/logo-white.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Academy Standards (SAFS & SACOS)',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Standards & Architecture',
          items: [
            {
              label: 'SAFS-00 Lexicon & Taxonomy',
              to: '/safs/00',
            },
          ],
        },
        {
          title: 'Organization',
          items: [
            {
              label: 'Simplicion Private Limited',
              href: 'https://simplicion.com',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Simplicion Private Limited. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
