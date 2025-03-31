export interface IConfigJson {
  bot: {
    token: string;
    prefix: string;
    owners: string[];
  };
  slot: {
    categories: {
      [key: string]: string;
    };
    sellerRole: string;
    logChannel: string;
    embedColor: string;
    footerText: string;
    templates: {
      [key: string]: {
        duration: number;
        pings: {
          here: number;
          everyone: number;
        };
      };
    };
  };
}