using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sagaji.Services.Models
{
    public class AppUser : IUser
    {
        //Existing database fields
        public long AppUserId { get; set; }
        public string AppUserName { get; set; }
        public string AppPassword { get; set; }

        public AppUser()
        {
            this.Id = Guid.NewGuid().ToString();
        }


        public virtual string Id { get; set; }
        public string UserName
        {
            get
            {
                return AppUserName;
            }
            set
            {
                AppUserName = value;
            }
        }
    }

}
