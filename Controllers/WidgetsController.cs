using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using WidgetRegistry.Models;

namespace WidgetRegistry.Controllers
{
    [Route("api/[controller]")]
    public class WidgetsController : Controller
    {
        [Route("all")]
        [HttpGet]
        public IActionResult GetWidgets()
        {
            return new ObjectResult(new[]
            {
    			new Widget() { id = "1", name = "qwe", amount = 123, description = "asd" },
    			new Widget() { id = "2", name = "asd", amount = 456, description = "zxc" },
				new Widget() { id = "3", name = "zxc", amount = 789, description = "qwe" }
            });
        }

        [HttpPut]
        public IActionResult CreateWidget([FromBody] Widget widget)
        {
            return ResultFromWidget(widget);
        }

        [HttpPost]
        public IActionResult UpdateWidget([FromBody] Widget widget)
        {
            return ResultFromWidget(widget);
        }

        [HttpDelete]
        public IActionResult DeleteWidget(int id)
        {
            return new EmptyResult();
        }

        [HttpPatch]
        public IActionResult UndeleteWidget(int id)
        {
            return new EmptyResult();
        }

        private IActionResult ResultFromWidget(Widget widget)
        {
            if (null == widget || string.IsNullOrEmpty(widget.name) || "error" == widget.name)
            {
                return new HttpStatusCodeResult(500);
            }

            return new EmptyResult();
        }
    }
}
