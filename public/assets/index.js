"use strict";
const version = "ABWEATHER-V1";
const appid = "85e7481d8cfba840c714f532c6a2f18f";

const getDay = (n) => {
	let day;
	switch (n){
		case 0: day = "Sunday";break;
		case 1: day = "Monday";break;
		case 2: day = "Tuesday";break;
		case 3: day = "Wednesday";break;
		case 4: day = "Thursday";break;
		case 5: day = "Friday";break;
		case 6: day = "Saturday";break;
	}

	return day;
}

const getTime = (hour, minute) => {
	let meridian = "AM";
	if (hour > 11) {
		hour = hour % 12;
		meridian = "PM"
	};
	if (hour < 10) {
		hour = `0${hour}`;
	}
	if (minute < 10) {
		minute = `0${hour}`;
	}

	return `${hour}:${minute} ${meridian}`;
}
const parseMonth = (n) => {
	let month = "";
	switch (n) {
		case 0: month = "January";break;
		case 1: month = "February";break;
		case 2: month = "March";break;
		case 3: month = "April";break;
		case 4: month = "May";break;
		case 5: month = "June";break;
		case 6: month = "July";break;
		case 7: month = "August";break;
		case 8: month = "September";break;
		case 9: month = "October";break;
		case 10: month = "November";break;
		case 11: month = "December";break;
	}
}

let searchWeather = () => {
	const search = document.getElementById('searchBox').value;
	if (search.length > 0) {
		queryWeatherMap(processResponse, search)
	} else {
		alert("No city in search");
	}

};

let queryWeatherMap = async (callback, search) => {
	try {
		const response = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${search}&appid=${appid}&units=metric`);
		const clone = response.clone();
		const json = await response.json();

		const cache = await caches.open(version);
		cache.put(clone.url, clone);
		callback(json);
	} catch (e) {
		console.error(e);
	}
};

let autoLoadWeather = () => {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(async (pos) => {
			const response = await fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=${appid}&units=metric`);
			const clone = response.clone();
			const json = await response.json();

			const cache = await caches.open(version);
			cache.put(clone.url, clone);
			processResponse(json);
		});
	}
};

let processResponse = async (json) => {
	const display_pane = document.getElementById('main-display-pane');
	const advanced_pane = document.getElementById('advanced-display');
	const date = new Date();
	const month = parseMonth(date.getMonth());
	const day = getDay(date.getDay());
	const str_date = date.getUTCDate();
	const time = getTime(date.getHours(), date.getMinutes());
	
	const {weather, main, name, sys, coord, clouds, visibility} = json;
	const {country} = sys;
	const main_weather = weather[0].main;
	const icon = weather[0].icon;
	const description = weather[0].description;
	const {temp, humidity, pressure, temp_max, feels_like} = main;
	const iconurl = `http://openweathermap.org/img/w/${icon}.png`;

	const iconResponse = await fetch(iconurl);
	const cache = await caches.open(version);
	cache.put(icon, iconResponse);

	const object = Object.freeze({
		main_weather, 
		icon, 
		description, 
		temp, 
		country, 
		visibility, 
		humidity, 
		pressure, 
		temp_max, 
		clouds, 
		coord, 
		day, 
		str_date, 
		time
	});

	document.getElementById('weather-display-panel').style.display = "block";

	display_pane.innerHTML = `
	<img src='${iconurl}'> 
	<p class="large">${name}, ${country}</p>
	<p class="large capitalize">${description}</p> 
	<p class="jumbo">${main_weather}</p> 
	<p class="jumbo">${temp}&degC</p>
	<p>${day}, ${month} ${str_date}, ${time}</p>`;

	advanced_pane.innerHTML = `
	<p>Feels Like: ${feels_like}&degC</p>
	<p>Humidity: ${humidity}%</p>
	<p>Pressure: ${pressure}hPa</p>
	<p>Visibility: ${visibility}metres</p>
	`;

	localStorage.setItem(`${name}`, JSON.stringify(object));
}

if (navigator.onLine) {
	autoLoadWeather();
}