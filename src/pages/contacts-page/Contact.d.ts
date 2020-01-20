interface Contact {
  uid?: string;
  addedAt?: string;
  addedBy?: string;
  displayName?: string;
  email: string;
  /*
    Deprecated.  Can be removed.
    This flag is contact's subscription status active/inactive.
    It was created when we had the option to activate/deactivate a subscriber using our UI.
    Currently the status is stored in MailChimp.
   */
  isActive: boolean;
  isMember: boolean;
  membershipExpiresAt?: string;
}

export default Contact
