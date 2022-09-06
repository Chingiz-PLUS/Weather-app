const axios = require("axios");
const yargs = require("yargs");
const table = require("cli-table");
const colors = require("colors");
const inquirer = require("inquirer");

const round = require("round.js");
const latinize = require("latinize");

var tableForCountry = new table({
  head: ["Country Name", "Capital Name", "Temprature", "Feels like"],
  colWidths: [30, 30, 30, 30],
});

yargs
  .command({
    command: `show-country <countryName>`,
    description: "show the temprature of Capital city of the selected country",
    f: "farenheit",

    handler: async (argv) => {
      try {
        const { data } = await axios.get(
          `https://restcountries.com/v3.1/name/${argv.countryName}`
        );
        if (data.length == 0) {
          console.log("qeyd oolunan olke tapilmadi");
        } else {
          for (let i = 0; i < data.length; i++) {
            try {
              const temp = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${latinize(
                  data[i].capital[0]
                )}&appid=ea61a9372a26674344f0c90c9bd9ee19`
              );
              tableForCountry.push([
                data[i].name.common,
                data[i].capital[0],
                argv.f
                  ? round.up(((temp.data.main.temp - 273.15) * 9) / 5 + 30, 2) +
                    " °F"
                  : round.up(temp.data.main.temp - 273.15, 2) + " °C",
                argv.f
                  ? round.up(
                      ((temp.data.main.feels_like - 273.15) * 9) / 5 + 30,
                      2
                    ) + " °F"
                  : round.up(temp.data.main.feels_like - 273.15, 2) + " °C",
              ]);
            } catch (e) {
              console.log(e);
            }
          }
          console.log(tableForCountry.toString());
        }
      } catch (e) {
        console.log(e);
      }
    },
  })
  .command({
    command: `show-city <countryName>`,
    description: `cities of the country`,
    f: "farenheit",
    handler: async (argv) => {
      try {
        const { data } = await axios.get(
          `https://countriesnow.space/api/v0.1/countries`
        );
        const cities = data.data.find(
          (e) => e.country == argv.countryName
        ).cities;
        inquirer
          .prompt([
            {
              type: "list",
              name: "city",
              message: "City:",
              choices: cities,
            },
          ])
          .then(async (answers) => {
            try {
              const temp = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${latinize(
                  answers.city
                )}&appid=ea61a9372a26674344f0c90c9bd9ee19`
              );
              tableForCountry.push([
                argv.countryName,
                answers.city,
                argv.f
                  ? round.up(((temp.data.main.temp - 273.15) * 9) / 5 + 30, 2) +
                    " °F"
                  : round.up(temp.data.main.temp - 273.15, 2) + " °C",
                argv.f
                  ? round.up(
                      ((temp.data.main.feels_like - 273.15) * 9) / 5 + 30,
                      2
                    ) + " °F"
                  : round.up(temp.data.main.feels_like - 273.15, 2) + " °C",
              ]);
              console.log(tableForCountry.toString());
            } catch (e) {
              console.log(e);
            }
          });
      } catch (e) {
        console.log(colors.red("input country name capitalize"));
      }
    },
  })
  .help().argv;
