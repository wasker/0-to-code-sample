using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;

namespace WidgetRegistry.Models
{
	public class Widget
	{
		public string id { get; set; }
		
		public string name { get; set; }
		
		public double amount { get; set; }

		public string description { get; set; }
	}
}
