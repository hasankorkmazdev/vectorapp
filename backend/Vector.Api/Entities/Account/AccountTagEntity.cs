using System;
using Vector.Api.Entities.Tag;

namespace Vector.Api.Entities.Account
{
    public class AccountTagEntity
    {
        public Guid AccountId { get; set; }
        public AccountEntity? Account { get; set; }
        public Guid TagId { get; set; }
        public TagEntity? Tag { get; set; }
    }
}
