// export interface User {
//   // user: SetStateAction<User | null>;
//   preferences: {
//     theme: "light" | "dark";
//     notification: boolean;
//     language: string;
//   };
//   _id: string;
//   name: string;
//   email: string;
//   isAdmin: boolean;
//   roles: string[];
//   photo: string;
//   location: string;
//   createdAt: string; // use Date if you always parse
//   updatedAt: string;
// }

export interface Preferences {
  theme: string;
  notification: boolean;
  language: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  roles: string[];
  photo: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  preferences: Preferences;
}
