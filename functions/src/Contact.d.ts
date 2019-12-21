interface Contact {
  uid?: string;
  addedAt?: string;
  addedBy?: string;
  displayName?: string;
  email: string;
  isActive: boolean;
  isMember: boolean;
  membershipExpiresAt?: string;
}

export default Contact
