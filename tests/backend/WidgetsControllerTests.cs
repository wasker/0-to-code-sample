using System;
using Microsoft.AspNet.Mvc;
using WidgetRegistry.Controllers;
using WidgetRegistry.Models;
using Xunit;

namespace WidgetRegistry.Tests
{
    public class WidgetsControllerTests
    {
        private readonly WidgetsController controller = new WidgetsController();

        [Fact]
        public void GetWidgets_CorrectResponse()
        {
            var result = controller.GetWidgets() as ObjectResult;
            Assert.NotNull(result);

            var widgets = result.Value as Widget[];
            Assert.NotNull(widgets);
            Assert.Equal(3, widgets.Length);
        }

        [Fact]
        public void CreateWidget_CorrectResponse()
        {
            var result = controller.CreateWidget(CreateValidWidget()) as EmptyResult;
            Assert.NotNull(result);
        }

        [Fact]
        public void CreateWidget_ErrorResponse()
        {
            var result = controller.CreateWidget(CreateWidgetWithError()) as HttpStatusCodeResult;
            Assert.NotNull(result);
            Assert.Equal(500, result.StatusCode);
        }

        [Fact]
        public void UpdateWidget_CorrectResponse()
        {
            var result = controller.UpdateWidget(CreateValidWidget()) as EmptyResult;
            Assert.NotNull(result);
        }

        [Fact]
        public void UpdateWidget_ErrorResponse()
        {
            var result = controller.UpdateWidget(CreateWidgetWithError()) as HttpStatusCodeResult;
            Assert.NotNull(result);
            Assert.Equal(500, result.StatusCode);
        }

        [Fact]
        public void DeleteWidget_CorrectResponse()
        {
            var result = controller.DeleteWidget(1) as EmptyResult;
            Assert.NotNull(result);
        }

        [Fact]
        public void UndeleteWidget_CorrectResponse()
        {
            var result = controller.UndeleteWidget(1) as EmptyResult;
            Assert.NotNull(result);
        }

        private Widget CreateValidWidget()
        {
            return new Widget()
            {
                id = "1",
                name = "test",
                amount = 123
            };
        }

        private Widget CreateWidgetWithError()
        {
            return new Widget()
            {
                id = "1",
                name = "error",
                amount = 123
            };
        }
    }
}
