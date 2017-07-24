using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace Sagaji.Services.Models
{
    public static class EnumHelper
    {
        /// <summary>
        /// Retrieve the description on the enum, e.g.
        /// [Description("Bright Pink")]
        /// BrightPink = 2,
        /// Then when you pass in the enum, it will retrieve the description
        /// </summary>
        /// <param name="en">The Enumeration</param>
        /// <returns>A string representing the friendly name</returns>
        public static string GetDescription(Enum en)
        {
            Type type = en.GetType();

            MemberInfo[] memInfo = type.GetMember(en.ToString());

            if (memInfo != null && memInfo.Length > 0)
            {
                object[] attrs = memInfo[0].GetCustomAttributes(typeof(DescriptionAttribute), false);

                if (attrs != null && attrs.Length > 0)
                {
                    return ((DescriptionAttribute)attrs[0]).Description;
                }
            }

            return en.ToString();
        }

        internal static IEnumerable<NumericValueSelectListItem> GetSelectList()
        {
            List<NumericValueSelectListItem> items = new List<NumericValueSelectListItem>();
            var values = Enum.GetValues(typeof(EnumPlatform));

            foreach (EnumPlatform value in values)
            {
                var item = new NumericValueSelectListItem
                {
                    Text = GetDescription(value),
                    Value = (short)value,
                };

                items.Add(item);
            }

            return items;
        }
    }
}
