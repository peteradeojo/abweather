"use strict";
const version = "ABWEATHER-V2";
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
const jsUcfirst = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const getTime = (hour, minute) => {
	let meridian = hour > 11 ? "PM": "AM";

	if (hour > 12) {
		hour = hour % 12;
	};
	if (hour < 10) {
		hour = `0${hour}`;
	}
	if (minute < 10) {
		minute = `0${hour}`;
	}

	return `${hour}:${minute}${meridian}`;
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

	return month;
}

let searchWeather = () => {
	let search = document.getElementById('searchBox').value;
	if (search.length > 0) {
		search = jsUcfirst(search);
		queryWeatherMap(processResponse, search)
	} else {
		alert("No city in search");
	}

};

let queryWeatherMap = async (callback, search) => {
	try {
		const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${search}&appid=${appid}&units=metric`);		
		const clone = response.clone();
		const json = await response.json();

		const cache = await caches.open(version);
		cache.put(clone.url, clone);
		callback(json, clone.url, search);
	} catch (e) {
		alert('You must be offline. Please go online to get real time weather');
	}
};

let autoLoadWeather = () => {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(async (pos) => {
			const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=${appid}&units=metric`);
			const clone = response.clone();
			const json = await response.json();

			const cache = await caches.open(version);
			cache.put(clone.url, clone);
			processResponse(json, clone.url);
		});
	}
};

let processResponse = async (json, url) => {
	const display_pane = document.getElementById('main-display-pane');
	const advanced_pane = document.getElementById('advanced-display');
	const date = new Date();
	const month = parseMonth(date.getMonth());
	const day = getDay(date.getDay());
	const str_date = date.getUTCDate();
	const time = getTime(date.getHours(), date.getMinutes());
	
	try {
		const {weather, main, name, sys, visibility} = json;
		const {country} = sys;
		const main_weather = weather[0].main;
		const icon = weather[0].icon;
		const description = weather[0].description;
		const {temp, humidity, pressure, feels_like} = main;
		const iconurl = `https://openweathermap.org/img/w/${icon}.png`;

		const iconResponse = await fetch(iconurl);
		const cache = await caches.open(version);
		cache.put(iconurl, iconResponse);

		localStorage.setItem(`${name}`, url);
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

	} catch (e) {
		alert("Invalid search parameters. Please try again");
	}
 
}

const removeSearch = (key) => {
	console.log(key);
	localStorage.removeItem(key);
}

const generateHistory = () => {
	let length = localStorage.length;
	let lists = "";
	if (length < 1) {
		lists = "No searches in history. Please make a search to get history";
		document.getElementById('history-list').setAttribute('data-state', 'empty');
		document.getElementById('history-list').innerHTML = lists;
		return undefined;
	}
	for (let index = 0; index < localStorage.length; index += 1) {
		let key = localStorage.key(index);
		lists += `
		<li class="entry">
			<p onclick="queryWeatherMap(processResponse, '${key}')">${key}</p> 
			<button onclick='removeSearch("${key}"); this.parentElement.style.display = "none";'>&times;</button>
		</li>`;
	}
	
	document.getElementById('history-list').setAttribute('data-state', 'filled');
	document.getElementById('history-list').innerHTML = lists;
}

window.addEventListener('load', () =>{
	autoLoadWeather();
	generateHistory();
	if (!navigator.onLine) {
		document.getElementById('advanced-display').innerHTML = 'You are offline. Please go online to generate weather for your location';
	}
});