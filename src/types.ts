import type socialIcons from "@assets/socialIcons";

export type Site = {
  website: string;
  author: string;
  profile: string;
  desc: string;
  title: string;
  ogImage?: string;
  lightAndDarkMode: boolean;
  postPerIndex: number;
  postPerPage: number;
  scheduledPostMargin: number;
};

export type SocialObjects = {
  name: keyof typeof socialIcons;
  href: string;
  active: boolean;
  linkTitle: string;
}[];

export type Project = {
  title: string;
  description: string;
  /** Path of the image inside `public/`, eg. "/assets/images/projects/my-app.png" */
  image?: string;
  /** Alternative text of the image, falls back to the project title */
  imageAlt?: string;
  /** Live website of the project, omit it if there is none */
  website?: string;
  /** Repository URL, only for open source projects */
  github?: string;
  /** Technologies used, displayed as tags */
  tags: string[];
  /** Displayed first when true */
  featured?: boolean;
};
