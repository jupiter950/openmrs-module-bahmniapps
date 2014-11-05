if (navigator.userAgent.match(/iPhone|iPod|iPad/i)) {
	$(function(){
		//This fix is needed when we use fastclick.js on ipad
		$(document).on("click", "label[for]", function(event) {
			event.preventDefault();
			var $inputElement = $('#' + $(this).attr('for'));
			var elementType = $inputElement.attr('type')
			if(elementType === 'radio') {
				$inputElement.prop('checked', true)
			} else if(elementType === 'checkbox') {
				$inputElement.prop('checked', !$inputElement.prop('checked'))
			} else {
				$inputElement.focus();
			}
		});
	});
}