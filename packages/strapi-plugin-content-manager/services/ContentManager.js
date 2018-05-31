'use strict';

const _ = require('lodash');

const getTitle = record => {
  const keys = ['displayName', 'name', 'title', 'header', 'text', 'description'];

  for(let key of keys) {
    if(record[key]) {
      return record[key];
    }  
    else if(record[`${key}_sv`]) {
      return record[`${key}_sv`]
    }
    else if(record[`${key}_en`]) {
      return record[`${key}_en`]
    }
  }

  return record._id
}

/**
 * A set of functions called "actions" for `ContentManager`
 */

module.exports = {
  fetchAll: async (params, query) => {
    const { limit, skip = 0, sort, query : request, queryAttribute, source, page, populate = [] } = query; // eslint-disable-line no-unused-vars

    // Find entries using `queries` system
    return await strapi.query(params.model, source).find({
      limit,
      skip,
      sort,
      where: request,
      queryAttribute,
    }, populate);
  },

  count: async (params, source) => {
    return await strapi.query(params.model, source).count();
  },

  fetch: async (params, source, populate, raw = true) => {
    return await strapi.query(params.model, source).findOne({
      id: params.id
    }, populate, raw);
  },

  add: async (params, values, source) => {
    // Multipart/form-data.
    if (values.hasOwnProperty('fields') && values.hasOwnProperty('files')) {
      // Silent recursive parser.
      const parser = (value) => {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Silent.
        }

        return _.isArray(value) ? value.map(obj => parser(obj)) : value;
      };

      const files = values.files;

      // Parse stringify JSON data.
      values = Object.keys(values.fields).reduce((acc, current) => {
        acc[current] = parser(values.fields[current]);

        return acc;
      }, {});

      // Update JSON fields.
      const entry = await strapi.query(params.model, source).create({
        values
      });

      // Then, request plugin upload.
      if (strapi.plugins.upload && Object.keys(files).length > 0) {
        // Upload new files and attach them to this entity.
        await strapi.plugins.upload.services.upload.uploadToEntity({
          id: entry.id || entry._id,
          model: params.model
        }, files, source);
      }

      return strapi.query(params.model, source).findOne({
        id: entry.id || entry._id
      });
    }

    // Create an entry using `queries` system
    return await strapi.query(params.model, source).create({
      values
    });
  },

  edit: async (params, values, source) => {
    // Multipart/form-data.
    if (values.hasOwnProperty('fields') && values.hasOwnProperty('files')) {
      // Silent recursive parser.
      const parser = (value) => {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Silent.
        }

        return _.isArray(value) ? value.map(obj => parser(obj)) : value;
      };

      const files = values.files;

      // Parse stringify JSON data.
      values = Object.keys(values.fields).reduce((acc, current) => {
        acc[current] = parser(values.fields[current]);

        return acc;
      }, {});

      // Update JSON fields.
      await strapi.query(params.model, source).update({
        id: params.id,
        values
      });

      // Then, request plugin upload.
      if (strapi.plugins.upload) {
        // Upload new files and attach them to this entity.
        await strapi.plugins.upload.services.upload.uploadToEntity(params, files, source);
      }

      return strapi.query(params.model, source).findOne({
        id: params.id
      });
    }

    // Raw JSON.
    return strapi.query(params.model, source).update({
      id: params.id,
      values
    });
  },

  delete: async (params, { source }) => {
    const response = await strapi.query(params.model, source).findOne({
      id: params.id
    });

    params.values = Object.keys(JSON.parse(JSON.stringify(response))).reduce((acc, current) => {
      const association = (strapi.models[params.model] || strapi.plugins[source].models[params.model]).associations.filter(x => x.alias === current)[0];

      // Remove relationships.
      if (association) {
        acc[current] = _.isArray(response[current]) ? [] : null;
      }

      return acc;
    }, {});

    if (!_.isEmpty(params.values)) {
      // Run update to remove all relationships.
      await strapi.query(params.model, source).update(params);
    }

    // Delete an entry using `queries` system
    return await strapi.query(params.model, source).delete({
      id: params.id
    });
  },

  getRefs: async (query = {}) => {
    const { core_store, ...models } = strapi.models;
    let propertyKeys = Object.keys(models);
    const { model, name } = query;

    if(model) {
      const attributes = _.get(models, `${model}._attributes`);    
      
      if(attributes) {
        // Get the attribute that is of type refs and match the requested field
        const refField = Object.entries(attributes)
          .map(([key, rest]) => ({ 
            ...rest,
            name: key
          }))
          .find(a => a.type === 'refs' && a.name === name);

        const allowedRefs = refField.refs;
        if(allowedRefs && allowedRefs.length > 0) {
          propertyKeys = propertyKeys.filter(key => allowedRefs.includes(key))
        }      
      }
    }

    const fetchAllModels = propertyKeys.map(async model => {
      const allRecords = await module.exports.fetchAll({ model }, {});

      return allRecords.map(record => ({
        id: record._id,
        title: getTitle(record),
        type: model
      }));
    });


    return _.flatten(await Promise.all(fetchAllModels));
  },
};
