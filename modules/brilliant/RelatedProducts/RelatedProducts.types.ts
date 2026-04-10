export interface RelatedProductsCmsLink {
  url: string;
  text: string;
  newTab: boolean;
  type: 'isPage' | 'isExternal' | 'isEmail' | 'isPhone';
}

export interface RelatedProductsCms {
  heading: string;
  design: 'expanded' | 'normal';
  link: RelatedProductsCmsLink;
}
