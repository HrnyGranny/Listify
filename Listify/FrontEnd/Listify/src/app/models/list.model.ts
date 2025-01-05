export interface ListItem {
  item: string;
  checked: boolean;
  amountInitial: number;
  amountFinal: number;
}

export interface List {
  _id: string;
  name: string;
  owner: string;
  content: ListItem[];
  share: string[];
  createdAt?: Date;
  updatedAt?: Date;
}